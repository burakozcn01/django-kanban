// @mui
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import InputBase from "@mui/material/InputBase";
import { useMockedUser } from "./utils/use-mocked-user";
import TextareaAutosize from '@mui/material/TextareaAutosize';

// components

// ----------------------------------------------------------------------
import React, { useState } from 'react';
import { addComment } from "../../services/kanban";
// ...other imports...

export default function KanbanDetailsCommentInput({ task }) {
  const { user } = useMockedUser();
  const [comment, setComment] = useState(''); 

  const handleCommentSubmit = () => {
    addComment({ task: task.id, content: comment }); 
    setComment(''); 
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        py: 3,
        px: 2.5
      }}
    >
      <Avatar src={comment.avatarUrl} />

      <Paper
        variant="outlined"
        sx={{ p: 1, flexGrow: 1, bgcolor: "transparent" }}
      >
        <InputBase
          fullWidth
          multiline
          rows={2}
          placeholder="Mesajınızı yazın..."
          sx={{ px: 1 }}
          value={comment} // Bind the value to the state variable
          onChange={(e) => setComment(e.target.value)} // Update the state variable when the input changes
        />

        <Stack direction="row" alignItems="center">
          <Stack direction="row" flexGrow={1}>
          </Stack>

          <Button variant="contained" onClick={handleCommentSubmit}>Gönder</Button> {/* Add an onClick handler here */}
        </Stack>
      </Paper>
    </Stack>
  );
}
