import { useCallback } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
// @mui
import { alpha } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
// hooks
import { useBoolean } from "./utils/use-boolean";
// api
import {
  updateColumn,
  clearColumn,
  deleteColumn,
  createTask,
  updateTask,
  deleteTask,
} from "../../services/kanban";
// components
import Iconify from "./components/iconify";
//
import KanbanTaskAdd from "./kanban-task-add";
import KanbanTaskItem from "./kanban-task-item";
import KanbanColumnToolBar from "./kanban-column-tool-bar";

export default function KanbanColumn({ column, tasks, index }) {
  const openAddTask = useBoolean();

  const handleUpdateColumn = useCallback(
    async (columnName) => {
      try {
        if (column.name !== columnName) {
          updateColumn(column.id, columnName);

          console.log("Update success!", {
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    [column.id, column.name]
  );

  const handleClearColumn = useCallback(async () => {
    try {
      clearColumn(column.id);
    } catch (error) {
      console.error(error);
    }
  }, [column.id]);

  const handleDeleteColumn = useCallback(async () => {
    try {
      deleteColumn(column.id);

      console.log("Delete success!", {
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
    } catch (error) {
      console.error(error);
    }
  }, [column.id]);

  const handleAddTask = useCallback(
    async (taskData) => {
      try {
        createTask(column.id, taskData);

        openAddTask.onFalse();
      } catch (error) {
        console.error(error);
      }
    },
    [column.id, openAddTask]
  );

  const handleUpdateTask = useCallback(async (taskData) => {
    try {
      updateTask(taskData);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleDeleteTask = useCallback(
    async (taskId) => {
      try {
        deleteTask(column.id, taskId);

        console.log("Delete success!", {
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
      } catch (error) {
        console.error(error);
      }
    },
    [column.id]
  );

  const renderAddTask = (
    <Stack
      spacing={2}
      sx={{
        pb: 3,
      }}
    >
      {openAddTask.value && (
        <KanbanTaskAdd
          status={column.name}
          onAddTask={handleAddTask}
          onCloseAddTask={openAddTask.onFalse}
        />
      )}

      <Button
        fullWidth
        size="large"
        color="inherit"
        startIcon={
          <Iconify
            icon={
              openAddTask.value
                ? "solar:close-circle-broken"
                : "mingcute:add-line"
            }
            width={18}
            sx={{ mr: -0.5 }}
          />
        }
        onClick={openAddTask.onToggle}
        sx={{ fontSize: 14 }}
      >
        {openAddTask.value ? "Close" : "Add Task"}
      </Button>
    </Stack>
  );

  return (
    <>
      <Paper
        sx={{
          px: 2,
          borderRadius: 2,
          bgcolor: '#7ED957',
        }}
      >
        <Stack>
          <KanbanColumnToolBar
            columnName={column.name}
            onUpdateColumn={handleUpdateColumn}
            onClearColumn={handleClearColumn}
            onDeleteColumn={handleDeleteColumn}
          />

          <Droppable droppableId={column.id} type="TASK">
            {(dropProvided) => (
              <Stack
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                spacing={2}
                sx={{
                  py: 3,
                  width: 280,
                }}
              >
                {column.taskIds.map((taskId, taskIndex) => (
                  <KanbanTaskItem
                    key={taskId}
                    index={taskIndex}
                    task={tasks[taskId]}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={() => handleDeleteTask(taskId)}
                  />
                ))}
                {dropProvided.placeholder}
              </Stack>
            )}
          </Droppable>
          {/* {renderAddTask} */}
        </Stack>
      </Paper>
    </>
  );
}
