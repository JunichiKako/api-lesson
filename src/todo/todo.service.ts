import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '../../generated/prisma/client';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  getAllTasks(userId: number): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  getTaskById(taskId: number, userId: number): Promise<Task | null> {
    return this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });
  }

  async createTask(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        userId,
      },
    });
    
  }

  async updateTask(taskId: number, updateTaskDto: UpdateTaskDto, userId: number): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new ForbiddenException('Task not found or access denied');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: updateTaskDto.title,
        description: updateTaskDto.description,
      },
    });
  }

  async deleteTask(taskId: number, userId: number): Promise<void> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new ForbiddenException('Task not found or access denied');
    }

    await this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}
