import { useCallback } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
// @mui
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";

// theme
import { hideScroll } from "./css";
// api
import { useGetBoard, moveColumn, moveTask, updateTask, dropUpdateTask } from "../../../services/kanban";
// components
import EmptyContent from "../components/empty-content";
//
import KanbanColumn from "../kanban-column";
import KanbanColumnAdd from "../kanban-column-add";
import { KanbanColumnSkeleton } from "../kanban-skeleton";

// ----------------------------------------------------------------------

export default function KanbanView() {
  const { board, boardLoading, boardEmpty } = useGetBoard();
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
  const onDragEnd = useCallback(
    async ({ destination, source, draggableId, type }) => {
      try {
        if (!destination) {
          return;
        }

        if (
          destination.droppableId === source.droppableId &&
          destination.index === source.index
        ) {
          return;
        }

        const sourceColumn = board?.columns[source.droppableId];

        const destinationColumn = board?.columns[destination.droppableId];

        // Moving task to same list
        if (sourceColumn.id === destinationColumn.id) {
          const newTaskIds = [...sourceColumn.taskIds];

          newTaskIds.splice(source.index, 1);

          newTaskIds.splice(destination.index, 0, draggableId);

          moveTask({
            ...board?.columns,
            [sourceColumn.id]: {
              ...sourceColumn,
              taskIds: newTaskIds,
            },
          });

          console.info("Moving to same list!");

          return;
        }

        // Moving task to different list
        const sourceTaskIds = [...sourceColumn.taskIds];

        const destinationTaskIds = [...destinationColumn.taskIds];

        // Remove from source
        sourceTaskIds.splice(source.index, 1);

        // Insert into destination
        destinationTaskIds.splice(destination.index, 0, draggableId);

        moveTask({
          ...board?.columns,
          [sourceColumn.id]: {
            ...sourceColumn,
            taskIds: sourceTaskIds,
          },
          [destinationColumn.id]: {
            ...destinationColumn,
            taskIds: destinationTaskIds,
          },
        });
        dropUpdateTask({taskId: draggableId, columnId: destinationColumn.id});
        console.info("Moving to different list!");
      } catch (error) {
        console.error(error);
      }
    },
    [board?.columns]
  );

  const renderSkeleton = (
    <Stack direction="row" alignItems="flex-start" spacing={3}>
      {[...Array(4)].map((_, index) => (
        <KanbanColumnSkeleton key={index} index={index} />
      ))}
    </Stack>
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        height: 1,
        padding: 2, // Add padding here
        bgcolor: "#242632", // Set the background color to darkblue
        color: "white", // Set the text color to white
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 4 }}> {/* Add marginBottom here */}
        <Avatar
          src="logo_url"
          sx={{ mr: 2, width: 80, height: 80}}
        />
        <Typography variant="h4" sx={{ color: "white" }}>İş Takip</Typography>
        <MenuItem
          disableRipple
          disableTouchRipple
          onClick={handleLogout}
          sx={{ typography: "body2", color: "error.main", py: 1.5 }}
        >
          Çıkış Yap
        </MenuItem>
      </Box>
      {boardLoading && renderSkeleton}

      {boardEmpty && (
        <EmptyContent
          filled
          title="No Data"
          sx={{
            py: 10,
            maxHeight: { md: 480 },
          }}
        />
      )}

      {!!board?.ordered.length && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" direction="horizontal">
            {(provided) => (
              <Stack
                ref={provided.innerRef}
                {...provided.droppableProps}
                spacing={3}
                direction="row"
                alignItems="flex-start"
                sx={{
                  p: 0.25,
                  height: 1,
                  overflowY: "hidden",
                  ...hideScroll.x,
                }}
              >
                {board?.ordered.map((columnId, index) => (
                  <KanbanColumn
                    index={index}
                    key={columnId}
                    column={board?.columns[columnId]}
                    tasks={board?.tasks}
                  />
                ))}

                {provided.placeholder}
                {/* 
                <KanbanColumnAdd /> */}
              </Stack>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Container>
  );
}
