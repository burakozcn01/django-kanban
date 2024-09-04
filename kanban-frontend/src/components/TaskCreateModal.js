import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col'; 
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import { fetchTaskChoices, createTask } from '../services/api';

const TaskCreateModal = ({ show, handleClose, onTaskCreated }) => {
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskStartDate, setTaskStartDate] = useState('');
    const [taskEndDate, setTaskEndDate] = useState('');
    const [taskPriority, setTaskPriority] = useState('');
    const [taskColumn, setTaskColumn] = useState('');
    const [taskTeam, setTaskTeam] = useState('');
    const [taskLabels, setTaskLabels] = useState([]);
    const [taskAssignees, setTaskAssignees] = useState([]);

    const [choices, setChoices] = useState({
        priorities: [],
        columns: [],
        teams: [],
        labels: [],
        users: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChoices();
    }, []);

    const fetchChoices = async () => {
        try {
            const data = await fetchTaskChoices();
            setChoices(data);
            setTaskPriority(data.priorities[0]?.value || '');
            setTaskColumn(data.columns[0]?.id || '');
            setTaskTeam(data.teams[0]?.id || '');
            setLoading(false);
        } catch (error) {
            console.error('Error fetching choices:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newTask = {
            name: taskName,
            description: taskDescription,
            start_date: taskStartDate,
            end_date: taskEndDate,
            priority: taskPriority,
            column: taskColumn,
            team: taskTeam,
            labels: taskLabels,
            assignees: taskAssignees,
        };

        try {
            const data = await createTask(newTask);
            onTaskCreated(data);
            handleClose();
        } catch (error) {
            console.error('Error creating task:', error.response.data);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Create Task</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="taskName" className="mb-3">
                        <Form.Label>Task Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="taskDescription" className="mb-3">
                        <Form.Label>Task Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Row>
                        <Col>
                            <Form.Group controlId="taskPriority" className="mb-3">
                                <Form.Label>Priority</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={taskPriority}
                                    onChange={(e) => setTaskPriority(e.target.value)}
                                >
                                    {choices.priorities.map(priority => (
                                        <option key={priority.value} value={priority.value}>
                                            {priority.label}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group controlId="taskColumn" className="mb-3">
                                <Form.Label>Column</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={taskColumn}
                                    onChange={(e) => setTaskColumn(e.target.value)}
                                >
                                    {choices.columns.map(column => (
                                        <option key={column.id} value={column.id}>
                                            {column.title}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Form.Group controlId="taskTeam" className="mb-3">
                                <Form.Label>Team</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={taskTeam}
                                    onChange={(e) => setTaskTeam(e.target.value)}
                                >
                                    {choices.teams.map(team => (
                                        <option key={team.id} value={team.id}>
                                            {team.name}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group controlId="taskLabels" className="mb-3">
                                <Form.Label>Labels</Form.Label>
                                <Form.Control
                                    as="select"
                                    multiple
                                    value={taskLabels}
                                    onChange={(e) =>
                                        setTaskLabels(
                                            [...e.target.selectedOptions].map((option) => option.value)
                                        )
                                    }
                                >
                                    {choices.labels.map(label => (
                                        <option key={label.id} value={label.id}>
                                            {label.name}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Form.Group controlId="taskAssignees" className="mb-3">
                                <Form.Label>Assignees</Form.Label>
                                <Form.Control
                                    as="select"
                                    multiple
                                    value={taskAssignees}
                                    onChange={(e) =>
                                        setTaskAssignees(
                                            [...e.target.selectedOptions].map((option) => option.value)
                                        )
                                    }
                                >
                                    {choices.users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.username}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Form.Group controlId="taskStartDate" className="mb-3">
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={taskStartDate}
                                    onChange={(e) => setTaskStartDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group controlId="taskEndDate" className="mb-3">
                                <Form.Label>End Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={taskEndDate}
                                    onChange={(e) => setTaskEndDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Button variant="primary" type="submit" className="mt-3">
                        Create Task
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default TaskCreateModal;
