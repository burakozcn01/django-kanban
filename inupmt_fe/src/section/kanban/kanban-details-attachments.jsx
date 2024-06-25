import React from 'react';
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LinkIcon from "@mui/icons-material/Link";

export default function KanbanDetailsAttachments({ attachments }) {
  if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
    return null; // attachments yoksa veya boşsa, bileşen hiçbir şey göstermez
  }

  return (
    <Stack direction="row" spacing={1}>
      {attachments.map((attachment, index) => (
        <Card key={index} variant="outlined" sx={{ backgroundColor: "#D0F1E9", height: "57px" }}>
          <CardContent style={{ display: "flex", alignItems: "center" }}>
            <LinkIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {getFileNameFromUrl(attachment.url)}
              </a>
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

function getFileNameFromUrl(url) {
  return url.substring(url.lastIndexOf('/') + 1);
}
