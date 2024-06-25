import React from 'react';
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Image from "./components/image";
import Lightbox, { useLightBox } from "./components/lightbox";
import { fToNow } from "./utils/format-time";

function findLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

function renderLink(link) {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      {link.length > 30 ? link.slice(0, 30) + "..." : link}
    </a>
  );
}

export default function KanbanDetailsCommentList({ comments }) {
  const slides = comments
    .filter(comment => comment.messageType === "image")
    .map(slide => ({ src: slide.message }));

  const lightbox = useLightBox(slides);

  return (
    <>
      <Stack
        spacing={3}
        flexGrow={1}
        sx={{
          py: 3,
          px: 2.5,
          bgcolor: '#D0F1E9',
        }}
      >
        {comments.map(comment => (
          <Stack key={comment.id} direction="row" spacing={2}>
            <Avatar src={comment.avatarUrl} />
            <Stack
              spacing={comment.messageType === "image" ? 1 : 0.5}
              flexGrow={1}
              className="comment-container"
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle2">{comment.name}</Typography>
                <Typography variant="caption" sx={{ color: "text.disabled" }}>
                  {fToNow(comment.createdAt)}
                </Typography>
              </Stack>

              <Typography variant="body2">
                {comment.messageType === "image" ? (
                  <Image
                    alt={comment.message}
                    src={comment.message}
                    onClick={() => lightbox.onOpen(comment.message)}
                    sx={{
                      borderRadius: 1.5,
                      cursor: "pointer",
                      transition: theme =>
                        theme.transitions.create(["opacity"]),
                      "&:hover": {
                        opacity: 0.8
                      }
                    }}
                  />
                ) : (
                  <>
                    {comment.message.split(/\s/).map((word, index) => {
                      if (findLinks(word).length > 0) {
                        return (
                          <React.Fragment key={index}>
                            {renderLink(word)}
                            {' '}
                          </React.Fragment>
                        );
                      }
                      return <React.Fragment key={index}>{word} </React.Fragment>;
                    })}
                  </>
                )}
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
      />
    </>
  );
}
