"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = exports.root = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const primsa = new client_1.PrismaClient();
const root = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("printing from the root");
    res.send("Welcome to the H3k ");
});
exports.root = root;
//Defineing the Zod schema for user validation while runtime
const userSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is Required"),
    email: zod_1.z.string().email("Invalid email address"),
    role: zod_1.z.enum(["VP", "MANAGER", "EMPLOYEE"]),
    vpId: zod_1.z.number().optional(),
    managerId: zod_1.z.number().optional(),
});
//API endpoinst creating new user
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //valodate userinpuut from zod
        const validaetData = userSchema.parse(req.body);
        //check for existing  user
        const existingUser = yield primsa.user.findUnique({
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
        const newUser = yield primsa.user.create({
            data: validaetData,
        });
        res.status(201).json(`${newUser} added`);
    }
    catch (error) {
        //if zod error validation error
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                erros: error.errors,
            });
        }
        //handle other errors
        res.status(500).json({
            error: "Internal Server Error",
        });
    }
});
exports.signup = signup;
