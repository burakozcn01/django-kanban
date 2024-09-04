import React, { useState, useEffect } from 'react';
import { fetchBoardData, updateTaskColumn, deleteTask, createTask } from '../services/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskModal from './TaskModal';
import TaskCreateModal from './TaskCreateModal';
import './KanbanBoard.css';

const KanbanBoard = () => {
  const [columns, setColumns] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [tasks, setTasks] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const boardData = await fetchBoardData();
        setColumns(boardData.columns);
        setColumnOrder(boardData.ordered);
        setTasks(boardData.tasks);
      } catch (error) {
        console.error('Error fetching board data:', error);
      }
    };
    fetchData();
  }, []);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const startColumn = columns[source.droppableId];
    const endColumn = columns[destination.droppableId];

    if (startColumn === endColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      setColumns({
        ...columns,
        [newColumn.id]: newColumn,
      });
    } else {
      const startTaskIds = Array.from(startColumn.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStart = {
        ...startColumn,
        taskIds: startTaskIds,
      };

      const endTaskIds = Array.from(endColumn.taskIds);
      endTaskIds.splice(destination.index, 0, draggableId);
      const newEnd = {
        ...endColumn,
        taskIds: endTaskIds,
      };

      setColumns({
        ...columns,
        [newStart.id]: newStart,
        [newEnd.id]: newEnd,
      });

      try {
        await updateTaskColumn(draggableId, destination.droppableId);
      } catch (error) {
        console.error('Error updating task column:', error);
      }
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleTaskCreated = async (newTask) => {
    try {
      const createdTask = await createTask(newTask);
      setTasks({
        ...tasks,
        [createdTask.id]: createdTask,
      });

      setColumns({
        ...columns,
        [createdTask.column]: {
          ...columns[createdTask.column],
          taskIds: [...columns[createdTask.column].taskIds, createdTask.id],
        },
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await deleteTask(taskId);

      const newTasks = { ...tasks };
      delete newTasks[taskId];

      const newColumns = { ...columns };
      for (const columnId in newColumns) {
        newColumns[columnId].taskIds = newColumns[columnId].taskIds.filter(id => id !== taskId);
      }

      setTasks(newTasks);
      setColumns(newColumns);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="kanban-board-container">
      <button className="add-task-button" onClick={handleOpenCreateModal}>Add New Task</button>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            const columnTasks = column.taskIds.map(taskId => tasks[taskId]);

            return (
              <Droppable droppableId={column.id} key={column.id}>
                {(provided) => (
                  <div 
                    className="kanban-column"
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                  >
                    <h2 className={`kanban-column-title ${column.name.replace(/\s+/g, '-').toLowerCase()}`}>
                      {column.name}
                    </h2>
                    <div className="kanban-column-content">
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="kanban-task"
                              onClick={() => handleTaskClick(task)}
                            >
                              <p>{task.name}</p>
                              <small>{task.description}</small>
                              <div className="task-meta">
                                <div className="assignee">
                                  {task.assignees.map(assignee => (
                                    <img key={assignee.id} src={assignee.avatarUrl} alt={assignee.username} />
                                  ))}
                                </div>
                                <span className="task-date">{task.start_date}</span>
                              </div>
                              <button onClick={() => handleTaskDelete(task.id)}>Delete</button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      <TaskModal
        show={showModal}
        handleClose={handleCloseModal}
        task={selectedTask}
      />

      <TaskCreateModal
        show={showCreateModal}
        handleClose={handleCloseCreateModal}
        columns={columns}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

export default KanbanBoard;
