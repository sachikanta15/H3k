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
exports.createTask = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const primsa = new client_1.PrismaClient();
//defineing the task schema
const taskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is Required'),
    description: zod_1.z.string().optional(),
    points: zod_1.z.number().min(0, 'Points must be a positive number').optional(),
    status: zod_1.z.enum(['Pending', 'In Progress', 'Completed']),
    userId: zod_1.z.number().int().positive('Invalid user ID')
});
//creating task api endpoints
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //validate the request body
        const validaetData = taskSchema.parse(req.body);
        //creat a task
        const newTask = yield primsa.task.creat({
            data: validaetData,
        });
    }
    finally {
    }
});
exports.createTask = createTask;
