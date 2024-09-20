import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

const prisma = new PrismaClient();

export const root = async (_req: Request, res: Response) => {
  console.log("printing from the root");
  res.send("Welcome to the H3k ");
};

//Defineing the Zod schema for user validation while runtime

//API endpoinst creating new user
export const signup = async (req: Request, res: Response) => {
  try {
    const userSchema = z.object({
      name: z.string().min(1, "Name is Required"),
      email: z.string().email("Invalid email address"),
      designation: z.string(),
      password: z.string().min(6),
      role: z.enum(["MANAGER", "EMPLOYEE"]),
    });
    //validate userinpuut from zod
    const validaetData = userSchema.parse(req.body);

    //check for valid invation

    //check for existing  user
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validaetData.email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User with this Email already exist",
      });
    }

    //create a new user in db

    const newUser = await prisma.user.create({
      data: {
        name: validaetData.name,
        email: validaetData.email,
        password: await bcrypt.hash(validaetData.password, 10),
        designation: validaetData.designation,
        role: validaetData.role,
      },
    });

    res.status(201).json({
      message: `User ${newUser.name} created successfully `,
    });
  } catch (error) {
    //if zod error validation error
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        erros: error.errors,
      });
    }
    //handle other errors
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userDetails = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      // expiresIn: "1h",
    });

    // Send the token back to the client
    res.json({
      message: "Login successful",
      // id: user.id,
      token,
      userDetails,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      return res.status(400).json({ error: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log("printing the id");
  console.log(id);
  try {
    const deleteUserSchema = z.object({
      userId: z.string(),
    });
    const validaetData = deleteUserSchema.parse(id);
    const deleteUser = await prisma.user.delete({
      where: {
        id: validaetData.userId,
      },
    });
    if (!deleteUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const createProject = async (req: Request, res: Response) => {
//   const { userId } = req.params;
//   console.log("printing the userId");
//   console.log(userId);
//   try {
//     // Extract userId from the request parameters

//     // Find the user from the database using the userId
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: { role: true }, // Only fetch the role of the user
//     });

//     // Check if the user exists and if the role is 'Manager'
//     if (!user || user.role !== "MANAGER") {
//       return res.status(403).json({
//         error: "Access denied. Only Managers can create projects.",
//       });
//     }

//     // Define schema for project data validation
//     const projectSchema = z.object({
//       name: z.string().min(1, "Project Name is Required"),
//       startingDate: z.string().date(),
//       endDate: z.string().date(),
//     });

//     // Validate the request body against the schema
//     const validatedData = projectSchema.parse(req.body);
//     console.log("printing the validate data");
//     console.log(validatedData);

//     // Check if a project with the same name already exists

//     const existingProject = await prisma.projects.findUnique({
//       //@ts-ignore
//       where: {
//         name: validatedData.name,
//       },
//     });

//     if (existingProject) {
//       return res.status(400).json({
//         error: "Project already exists",
//       });
//     }

//     // Create a new project in the database
//     const newProject = await prisma.projects.create({
//       data: {
//         name: validatedData.name,
//         startingDate: validatedData.startingDate,
//         endDate: validatedData.endDate,
//       },
//     });

//     // Return a success response
//     res.status(201).json(`${newProject.name} Project created successfully`);
//   } catch (error) {
//     // Handle Zod validation errors
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({
//         errors: error.errors,
//       });
//     }

//     // Handle other errors (e.g., server issues)
//     res.status(500).json({
//       error: "Internal Server Error",
//     });
//   }
// };

// export const createProject = async (req: Request, res: Response) => {
//   const { name, description, employees, managerId } = req.body;
//   //@ts-ignore

//   try {
//     const project = await prisma.project.create({
//       //@ts-ignore
//       data: {
//         name,
//         description,
//         managerId,
//         employees: {
//           connect: employees.map((id: number) => ({ id })),
//         },
//       },
//     });
//     res.json(project);
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ error: "Project creation failed" });
//   }
// };

export const createProject = async (req: Request, res: Response) => {
  const { name, description, managerId, employees, startDate, endDate } =
    req.body;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        manager: {
          connect: { id: managerId }, // Connect the manager
        },
        employees: {
          create: employees.map((employeeId: string) => ({
            employee: { connect: { id: employeeId } }, // Connect employees
          })),
        },
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      include: {
        manager: true,
        employees: {
          include: {
            employee: true,
          },
        },
      },
    });
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating project" });
  }
};

// export const projects = async (req: Request, res: Response) => {
//   try {
//     const getAllProjects = await prisma.project.findMany(
//       {
//         where:{

//         }
//       }
//     );
//     if (!getAllProjects) {
//       return res.status(400).json({
//         error: "NO Projects Found",
//       });
//     }
//     return res.status(200).json({
//       message: "All Projects Fetched Successfully",
//       projects: getAllProjects, // Return the projects here
//     });
//   } catch (error) {
//     // Handle Zod validation errors
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({
//         errors: error.errors,
//       });
//     }
//     // Handle other errors (e.g., server issues)
//     res.status(500).json({
//       error: "Internal Server Error",
//     });
//   }
// };

export const projects = async (req: Request, res: Response) => {
  try {
    // Assuming you have middleware that adds user information to the request
    console.log("printin gthe req");
    //@ts-ignore
    console.log(req.user);
    //@ts-ignore

    const userId = req.user;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized: User information not found",
      });
    }

    // const getAllProjects = await prisma.project.findMany({
    //   where: {
    //     OR: [
    //       { managerId: userId },
    //       {
    //         employees: {
    //           some: {
    //             employeeId: userId,
    //           },
    //         },
    //       },
    //     ],
    //   },
    //   include: {
    //     manager: true,
    //     employees: {
    //       include: {
    //         employee: true,
    //       },
    //     },
    //   },
    // });

    const getAllProjects = await prisma.project.findMany({
      where: {
        OR: [
          { managerId: userId },
          {
            employees: {
              some: {
                employeeId: userId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        managerId: true,
      },
    });

    // return projects;

    if (getAllProjects.length === 0) {
      return res.status(404).json({
        message: "No Projects Found",
      });
    }

    return res.status(200).json({
      message: "All Projects Fetched Successfully",
      projects: getAllProjects,
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        errors: error.errors,
      });
    }
    // Handle other errors (e.g., server issues)
    console.error("Error in projects route:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
export const getProjects = async (req: Request, res: Response) => {
  const projectId = req.body;
  try {
    const getProjects = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    if (!getProjects) {
      return res.status(400).json({
        error: "NO Projects Found",
      });
    }
    return res.status(200).json({
      message: "Projects Details Fetched Successfully",
      projects: getProjects, // Return the projects details
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const rateProjectAndEmployees = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const { projectRating, employeeRatings } = req.body;

  try {
    // Update project rating
    await prisma.rating.create({
      data: {
        projectId: projectId.toString(),
        rating: projectRating.rating,
        review: projectRating.review,
      },
    });

    // Rate employees
    for (const rating of employeeRatings) {
      await prisma.rating.create({
        data: {
          projectId: projectId.toString(),
          employeeId: rating.employeeId,
          rating: rating.rating,
          review: rating.feedback,
        },
      });
    }

    res.json({ message: "Project and employee ratings submitted" });
  } catch (error) {
    res.status(500).json({ error: "Rating submission failed" });
  }
};
