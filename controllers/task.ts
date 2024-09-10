import { Request,Response } from "express";
import { PrismaClient } from "@prisma/client";
import {z} from "zod";

const primsa = new PrismaClient();

//defineing the task schema

const taskSchema = z.object({
    title:z.string().min(1,'Title is Required'),
    description: z.string().optional(),
    points:z.number().min(0, 'Points must be a positive number').optional(),
    status:z.enum(['Pending','In Progress','Completed'])
    userId:z.number().int().positive('Invalid user ID')
});

//creating task api endpoints

export const createTask = async (req:Request,res:Response)=>{
    try{
        //validate the request body
        const validaetData = taskSchema.parse(req.body);

        //creat a task
       
        const newTask  = await primsa.task.creat({
            data:validaetData,
        });


    }
}