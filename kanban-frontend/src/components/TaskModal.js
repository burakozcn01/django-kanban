import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const TaskModal = ({ show, handleClose, task }) => {
    if (!task) return null;

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{task.name || 'No title available'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Description:</strong> {task.description || 'No description available'}</p>
                <p><strong>Priority:</strong> {task.priority || 'No priority available'}</p>
                <p><strong>Assigned To:</strong> 
                    {task.assignees && task.assignees.length > 0 
                        ? task.assignees.map(a => a.username).join(', ') 
                        : 'No assignees available'}
                </p>
                <p><strong>Team:</strong> {task.team?.name || 'No team available'}</p>
                <p><strong>Start Date:</strong> {task.start_timestamp ? new Date(task.start_timestamp).toLocaleDateString() : 'No start date available'}</p>
                <p><strong>End Date:</strong> {task.end_timestamp ? new Date(task.end_timestamp).toLocaleDateString() : 'No end date available'}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TaskModal;
