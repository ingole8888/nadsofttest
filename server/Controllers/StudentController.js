const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

createStudent = async (req, res) => {
    const { firstName, lastName, dateOfBirth, email } = req.body;
    try {
        const existingStudent = await prisma.student.findUnique({
            where: { email },
        });

        if (existingStudent) {
            return res.status(400).send({status: false, message: "Email already taken, please use a different email!"});
        }

        const student = await prisma.student.create({
            data: {
                firstName,
                lastName,
                dateOfBirth,
                email
            }
        });
        res.status(201).send({status:true, data:student});
    } catch (error) {
        res.status(500).send({status:false, error: error.message });
    }
};

getAllStudents = async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    try {
        const [students, total] = await prisma.$transaction([
            prisma.student.findMany({
                skip: parseInt(skip),
                take: parseInt(limit),
                where: {
                    OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ]
                },
                include:{
                    marks:true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.student.count({
                where: {
                    OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ]
                }
            })
        ]);

        res.status(200).send({
            status:true,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            data: students
        });
    } catch (error) {
        res.status(500).send({status:false, error: error.message });
    }
};

getStudentById = async (req, res) => {
    const { id } = req.params;
    try {
        const student = await prisma.student.findUnique({
            where: { id },
            include: { marks: true }
        });

        if(!student){
            res.status(404).send({status:false, message:"Student not found!"})
        }

        res.status(200).send({status:true, data:student});
    } catch (error) {
        res.status(500).send({status:false, error: error.message });
    }
};

updateStudent = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, dateOfBirth, email } = req.body;
    try {
        const student1 = await prisma.student.findUnique({
            where: { id },
        });

        if(!student1){
            res.status(404).send({status:false, message:"Student not found!"})
        }

        const student = await prisma.student.update({
            where: { id },
            data: { firstName, lastName, dateOfBirth, email }
        });
        res.status(200).send({status:true, data:student});
    } catch (error) {
        res.status(500).send({status:false, error: error.message });
    }
};

deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {

        const student1 = await prisma.student.findUnique({
            where: { id },
        });

        if(!student1){
            res.status(404).send({status:false, message:"Student not found!"})
        }

        await prisma.student.delete({ where: { id } });

        res.status(200).send({status:true, message: 'Student deleted' });
    } catch (error) {
        res.status(500).send({status:false, error: error.message });
    }
};

module.exports = {createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent}
