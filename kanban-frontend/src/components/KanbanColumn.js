import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, ListGroup } from 'react-bootstrap';

const KanbanColumn = ({ column, tasks }) => {
    return (
        <Card>
            <Card.Header className={`kanban-column-title ${column.name.replace(/\s+/g, '-').toLowerCase()}`}>
                {column.name}
            </Card.Header>
            <Droppable droppableId={column.id.toString()}>
                {(provided) => (
                    <ListGroup 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className="kanban-column-content"
                    >
                        {tasks.map((task, index) => (
                            <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                                {(provided) => (
                                    <ListGroup.Item 
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="kanban-task"
                                    >
                                        <div className="task-title">{task.name}</div>
                                        <div className="task-meta">
                                            {task.assignees.map(assignee => (
                                                <img key={assignee.id} src={assignee.avatar} alt={assignee.name} />
                                            ))}
                                            <span className="task-date">{task.start_date}</span>
                                        </div>
                                    </ListGroup.Item>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </ListGroup>
                )}
            </Droppable>
        </Card>
    );
};

export default KanbanColumn;
