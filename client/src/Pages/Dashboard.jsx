import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Pagination, FormControl, InputGroup, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { FaEdit, FaTrash, FaInfoCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10); // Default limit
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [newStudent, setNewStudent] = useState({
        firstName: '',
        email: '',
        age: '',
        parentId: ''
    });
    const [error, setError] = useState('');
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [marks, setMarks] = useState([]);
    const [newMark, setNewMark] = useState({
        subject: '',
        marks: 0,
        studentId: ''
    });


    useEffect(() => {
        fetchStudents();
    }, [page, search, limit]);

    const fetchStudents = async () => {
        try {
            const response = await axios.get('https://naddev.onrender.com/api/students', {
                params: {
                    page,
                    limit,
                    search
                }
            });
            setStudents(response.data.data);
            setTotalPages(Math.ceil(response.data.total / limit));
        } catch (error) {
            console.error('Error fetching student data:', error);
        }
    };

    const fetchMarks = async (studentId) => {
        try {
            const response = await axios.get(`https://naddev.onrender.com/api/students/${studentId}`);
            setMarks(response.data.data.marks);
            console.log(response.data.data.marks)
        } catch (error) {
            console.error('Error fetching marks:', error);
        }
    };

    const calculateAge = (dateOfBirth) => {
        const dob = new Date(dateOfBirth);
        const diffMs = Date.now() - dob.getTime();
        const ageDate = new Date(diffMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleMarkInputChange = (e) => {
        const { name, value } = e.target;
        setNewMark({ ...newMark, [name]: value });
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleLimitChange = (e) => {
        setLimit(parseInt(e.target.value));
        setPage(1); // Reset to the first page when limit changes
    };

    const handleEdit = (student) => {
        setSelectedStudentId(student.id);
        setNewStudent({
            firstName: student.firstName,
            email: student.email,
            age: student.age,
            parentId: student.parentId
        });
        setEditMode(true);
        handleModalShow();
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this student record!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`https://naddev.onrender.com/api/students/${id}`);
                    Swal.fire(
                        'Deleted!',
                        'The student record has been deleted.',
                        'success'
                    );
                    fetchStudents();
                } catch (error) {
                    console.error('Error deleting student:', error);
                    Swal.fire(
                        'Error!',
                        'Failed to delete the student record.',
                        'error'
                    );
                }
            }
        });
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditMode(false);
        setNewStudent({
            firstName: '',
            email: '',
            age: '',
            parentId: ''
        });
        setError('');
    };
    const handleModalShow = () => setShowModal(true);

    const handleInfoModalClose = () => {
        setShowInfoModal(false);
        setSelectedStudent(null);
        setMarks([]);
    };

    const handleInfoModalShow = async (student) => {
        setSelectedStudent(student);
        console.log(selectedStudent)
        await fetchMarks(student.id);
        setShowInfoModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStudent({ ...newStudent, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editMode) {
            // Update student
            try {
                const response = await axios.put(`https://naddev.onrender.com/api/students/${selectedStudentId}`, newStudent);
                if (response.status === 200) {
                    fetchStudents();
                    handleModalClose();
                    Swal.fire({
                        title: 'Success!',
                        text: 'Member has been updated successfully.',
                        icon: 'success',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                console.error('Error updating student:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to update the member.',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'OK'
                });
            }
        } else {
            // Add new student
            try {
                const response = await axios.post('https://naddev.onrender.com/api/students', newStudent);
                if (response.status === 201) {
                    fetchStudents();
                    handleModalClose();
                    Swal.fire({
                        title: 'Success!',
                        text: 'New member has been added successfully.',
                        icon: 'success',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    setError('Email already in use. Please use a different email.');
                } else {
                    console.error('Error adding new student:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to add the new member.',
                        icon: 'error',
                        confirmButtonColor: '#d33',
                        confirmButtonText: 'OK'
                    });
                }
            }
        }
    };

    const handleAddMark = async (e) => {
        e.preventDefault();
        if (selectedStudent) {
            const markData = {
                subject: newMark.subject,
                marks: parseInt(newMark.marks), // Ensure marks is passed as a number
                studentId: selectedStudent.id
            };
            try {
                const response = await axios.post('https://naddev.onrender.com/api/marks', markData);
                if (response.status === 201) {
                    await fetchMarks(selectedStudent.id);
                    setNewMark({
                        subject: '',
                        marks: ''
                    });
                    Swal.fire({
                        title: 'Success!',
                        text: 'Mark has been added successfully.',
                        icon: 'success',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                console.error('Error adding mark:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to add the mark.',
                    icon: 'error',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'OK'
                });
            }
        }
    };


    const [editMarkId, setEditMarkId] = useState(null);

    const handleEditMark = (markId) => {
        setEditMarkId(markId);
    };

    const handleCancelEditMark = () => {
        setEditMarkId(null);
    };

    const handleSaveEditMark = async (mark) => {
        const markData = {
            ...mark,
            marks: parseInt(mark.marks) // Ensure marks is passed as a number
        };
        try {
            await axios.put(`https://naddev.onrender.com/api/marks/${mark.id}`, markData);
            await fetchMarks(selectedStudent.id);
            setEditMarkId(null); // Reset edit mode
            Swal.fire({
                title: 'Success!',
                text: 'Mark has been updated successfully.',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
        } catch (error) {
            console.error('Error updating mark:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update the mark.',
                icon: 'error',
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        }
    };



    const handleDeleteMark = async (markId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this mark record!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`https://naddev.onrender.com/api/marks/${markId}`);
                    await fetchMarks(selectedStudent.id);
                    Swal.fire(
                        'Deleted!',
                        'The mark record has been deleted.',
                        'success'
                    );
                } catch (error) {
                    console.error('Error deleting mark:', error);
                    Swal.fire(
                        'Error!',
                        'Failed to delete the mark record.',
                        'error'
                    );
                }
            }
        });
    };


    return (
        <div className="container mt-4">
            <h2>All Members</h2>
            <Row className="mb-3">
                <Col>
                    <InputGroup>
                        <FormControl
                            placeholder="Search"
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </InputGroup>
                </Col>
                <Col className="d-flex justify-content-end">
                    <Button variant="primary" onClick={handleModalShow} style={{ backgroundColor: 'blue' }}>
                        Add New Member
                    </Button>
                </Col>
            </Row>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Member Name</th>
                        <th>Member Email</th>
                        <th>Age</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student, index) => (
                        <tr key={student.id}>
                            <td>{(page - 1) * limit + index + 1}</td>
                            <td>{student.firstName}</td>
                            <td>{student.email}</td>
                            <td>{student.age || "NA"}</td>
                            <td>
                                <FaEdit
                                    style={{ color: 'green', cursor: 'pointer', marginRight: '10px' }}
                                    onClick={() => handleEdit(student)}
                                />
                                <FaTrash
                                    style={{ color: 'red', cursor: 'pointer', marginRight: '10px' }}
                                    onClick={() => handleDelete(student.id)}
                                />
                                <FaInfoCircle
                                    style={{ color: 'blue', cursor: 'pointer', }}
                                    onClick={() => handleInfoModalShow(student)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Row className="align-items-center">
                <Col md={6}>
                    Show
                    <Form.Select value={limit} onChange={handleLimitChange} style={{ display: 'inline', width: 'auto', margin: '0 10px' }}>
                        <option value={1}>1</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                    </Form.Select>
                    entries
                </Col>
                <Col md={6} className="d-flex justify-content-end">
                    <Pagination>
                        <Pagination.Item onClick={() => handlePageChange(1)} disabled={page === 1}>
                            First
                        </Pagination.Item>
                        <Pagination.Item onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                            Previous
                        </Pagination.Item>
                        <Pagination.Item active>
                            {page}
                        </Pagination.Item>
                        <Pagination.Item onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
                            Next
                        </Pagination.Item>
                        <Pagination.Item onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}>
                            Last
                        </Pagination.Item>
                    </Pagination>
                </Col>
            </Row>

            {/* Add/Edit Student Modal */}
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? 'Edit Member' : 'Add New Member'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formFirstName">
                            <Form.Label>Member Name<span style={{ color: 'red' }}>*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter member name"
                                name="firstName"
                                value={newStudent.firstName}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmail" className="mt-3">
                            <Form.Label>Member Email<span style={{ color: 'red' }}>*</span></Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter member email"
                                name="email"
                                value={newStudent.email}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formAge" className="mt-3">
                            <Form.Label>Member Age<span style={{ color: 'red' }}>*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter member age"
                                name="age"
                                value={newStudent.age}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formParentID" className="mt-3">
                            <Form.Label>Member Parent ID</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter member parent ID"
                                name="parentId"
                                value={newStudent.parentId}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-center mt-4">
                            <Button variant="success" type="submit" style={{ backgroundColor: 'lightgreen' }}>
                                Submit
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showInfoModal} onHide={handleInfoModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Student Info</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedStudent && (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <h5>Student Name: {selectedStudent.firstName}</h5>
                            <Form onSubmit={handleAddMark}>
                                <Form.Group controlId="formSubject">
                                    <Form.Label>Subject</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter subject"
                                        value={newMark.subject}
                                        onChange={(e) => setNewMark({ ...newMark, subject: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="formMarks">
                                    <Form.Label>Marks</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter marks"
                                        value={newMark.marks}
                                        onChange={(e) => setNewMark({ ...newMark, marks: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <div className="d-grid gap-2">
                                    <Button variant="success" type="submit" style={{ marginTop: '10px', marginBottom: '10px', backgroundColor: 'lightgreen' }}>
                                        Add Mark
                                    </Button>
                                </div>
                            </Form>
                            <Table striped bordered hover>
                                {marks.map((mark, index) => (
                                    <tr key={mark.id}>
                                        <td>{index + 1}</td>
                                        <td>{editMarkId === mark.id ? (
                                            <Form.Control
                                                type="text"
                                                value={mark.subject}
                                                onChange={(e) => {
                                                    const newMarks = [...marks];
                                                    newMarks[index].subject = e.target.value;
                                                    setMarks(newMarks);
                                                }}
                                            />
                                        ) : mark.subject}</td>
                                        <td>{editMarkId === mark.id ? (
                                            <Form.Control
                                                type="number"
                                                value={mark.marks}
                                                onChange={(e) => {
                                                    const newMarks = [...marks];
                                                    newMarks[index].marks = e.target.value;
                                                    setMarks(newMarks);
                                                }}
                                            />
                                        ) : mark.marks}</td>
                                        <td>
                                            {editMarkId === mark.id ? (
                                                <div>
                                                    <Button variant="success" size="sm" onClick={() => handleSaveEditMark(mark)}>
                                                        Save
                                                    </Button>{' '}
                                                    <Button variant="secondary" size="sm" onClick={handleCancelEditMark}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <FaEdit
                                                        style={{ color: 'green', cursor: 'pointer', marginRight: '10px' }}
                                                        onClick={() => handleEditMark(mark.id)}
                                                    />
                                                    <FaTrash
                                                        style={{ color: 'red', cursor: 'pointer' }}
                                                        onClick={() => handleDeleteMark(mark.id)}
                                                    />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </Table>
                            <tbody>

                            </tbody>

                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default StudentList;
