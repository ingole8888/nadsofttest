const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

createMark = async (req, res) => {
    const { subject, marks, studentId } = req.body;
    try {
        const mark = await prisma.mark.create({
            data: {
                subject,
                marks,
                studentId
            }
        });
        res.status(201).send({ status: true, data: mark });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
};

getAllMarks = async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    try {
        const [marks, total] = await prisma.$transaction([
            prisma.mark.findMany({
                skip: parseInt(skip),
                take: parseInt(limit),
                where: {
                    OR: [
                        { subject: { contains: search, mode: 'insensitive' } }
                    ]
                },
                include: {
                    student: true
                }
            }),
            prisma.mark.count({
                where: {
                    OR: [
                        { subject: { contains: search, mode: 'insensitive' } }
                    ]
                }
            })
        ]);

        res.status(200).send({
            status: true,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            data: marks
        });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
};

getMarkById = async (req, res) => {
    const { id } = req.params;
    try {
        const mark = await prisma.mark.findUnique({
            where: { id },
            include: { student: true }
        });

        if (!mark) {
            return res.status(404).send({ status: false, message: "Mark not found!" });
        }

        res.status(200).send({ status: true, data: mark });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
};

updateMark = async (req, res) => {
    const { id } = req.params;
    const { subject, marks, studentId } = req.body;
    try {
        const existingMark = await prisma.mark.findUnique({
            where: { id },
        });

        if (!existingMark) {
            return res.status(404).send({ status: false, message: "Mark not found!" });
        }

        const mark = await prisma.mark.update({
            where: { id },
            data: { subject, marks, studentId }
        });
        res.status(200).send({ status: true, data: mark });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
};

deleteMark = async (req, res) => {
    const { id } = req.params;
    try {
        const existingMark = await prisma.mark.findUnique({
            where: { id },
        });

        if (!existingMark) {
            return res.status(404).send({ status: false, message: "Mark not found!" });
        }

        await prisma.mark.delete({ where: { id } });
        res.status(200).send({ status: true, message: 'Mark deleted' });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
};

module.exports = {createMark, getAllMarks, getMarkById, updateMark, deleteMark}
