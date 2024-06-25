import { useState, useCallback } from "react"
// @mui
import { styled, alpha } from "@mui/material/styles"
import Chip from "@mui/material/Chip"
import Stack from "@mui/material/Stack"
import Drawer from "@mui/material/Drawer"
import Button from "@mui/material/Button"
import Avatar from "@mui/material/Avatar"
import Divider from "@mui/material/Divider"
import Tooltip from "@mui/material/Tooltip"
import TextField from "@mui/material/TextField"
import IconButton from "@mui/material/IconButton"
import Box from "@mui/material/Box"
// hooks
import { useBoolean } from "./utils/use-boolean"
// components
import Iconify from "./components/iconify"
import CustomDateRangePicker, {
  useDateRangePicker
} from "./components/custom-date-range-picker"
//
import KanbanInputName from "./kanban-input-name"
import KanbanDetailsToolbar from "./kanban-details-toolbar"
import KanbanContactsDialog from "./kanban-contacts-dialog"
import KanbanDetailsPriority from "./kanban-details-priority"
import KanbanDetailsAttachments from "./kanban-details-attachments"
import KanbanDetailsCommentList from "./kanban-details-comment-list"
import KanbanDetailsCommentInput from "./kanban-details-comment-input"

// ----------------------------------------------------------------------

const StyledLabel = styled("span")(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightBold
}))

export default function KanbanDetails({
  task,
  openDetails,
  onCloseDetails,

  //
  onUpdateTask,

  onDeleteTask
}) {
  const [priority, setPriority] = useState(task.priority)

  const [taskName, setTaskName] = useState(task.name)

  const like = useBoolean()

  const contacts = useBoolean()

  const [taskDescription, setTaskDescription] = useState(task.description)

  const rangePicker = useDateRangePicker(task.due[0], task.due[1])

  const handleChangeTaskName = useCallback(event => {
    setTaskName(event.target.value)
  }, [])

  const handleUpdateTask = useCallback(
    event => {
      try {
        if (event.key === "Enter") {
          if (taskName) {
            onUpdateTask({
              ...task,
              name: taskName
            })
          }
        }
      } catch (error) {
        console.error(error)
      }
    },
    [onUpdateTask, task, taskName]
  )

  const handleChangeTaskDescription = useCallback(event => {
    setTaskDescription(event.target.value)
  }, [])

  const handleChangePriority = useCallback(newValue => {
    setPriority(newValue)
  }, [])

  const renderHead = (
    <KanbanDetailsToolbar
      liked={like.value}
      taskName={task.name}
      onLike={like.onToggle}
      onDelete={onDeleteTask}
      taskStatus={task.status}
      onCloseDetails={onCloseDetails}
    />
  )

  const renderName = (
    <KanbanInputName
      placeholder="Task name"
      value={taskName}
      onChange={handleChangeTaskName}
      onKeyUp={handleUpdateTask}
    />
  )
  const renderReporter = (
    <Stack direction="row" alignItems="center">
      <StyledLabel>İş Yöneticisi</StyledLabel>
      <Avatar alt={task.reporter.name} src={task.reporter.avatarUrl} />
    </Stack>
  )

  const renderAssignee = (
    <Stack direction="row">
      <StyledLabel sx={{ height: 50, lineHeight: "50px" }}>
        Atananlar
      </StyledLabel>

      <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
        {task.assignee.map(user => (
          <Avatar key={user.id} alt={user.name} src={user.avatarUrl} />
        ))}

        {/* <Tooltip title="Add assignee">
          <IconButton
            onClick={contacts.onTrue}
            sx={{
              bgcolor: theme => alpha(theme.palette.grey[500], 0.08),
              border: theme => `dashed 1px ${theme.palette.divider}`
            }}
          >
            <Iconify icon="mingcute:add-line" />
          </IconButton>
        </Tooltip> */}

        <KanbanContactsDialog
          assignee={task.assignee}
          open={contacts.value}
          onClose={contacts.onFalse}
        />
      </Stack>
    </Stack>
  )

  const renderLabel = (
    <Stack direction="row" alignItems="flex-start">
      <StyledLabel sx={{ height: 24, lineHeight: "24px" }}>Etiketler</StyledLabel>

      {!!task.labels.length && (
        <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
          {task.labels.map(label => (
            <Chip
              key={label}
              color="info"
              label={label}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>
      )}
    </Stack>
  )

  const renderDueDate = (
    <Stack direction="row" alignItems="center">
      <StyledLabel> Tarih </StyledLabel>
  
      {rangePicker.selected ? (
        rangePicker.shortLabel
      ) : (
        <>
          {rangePicker.startDate && rangePicker.endDate ? (
            rangePicker.shortLabel
          ) : (
            "Herhangi bir tarih aralığı verilmemiştir."
          )}
        </>
      )}
  
      <CustomDateRangePicker
        variant="calendar"
        title="Choose due date"
        startDate={rangePicker.startDate}
        endDate={rangePicker.endDate}
        onChangeStartDate={rangePicker.onChangeStartDate}
        onChangeEndDate={rangePicker.onChangeEndDate}
        open={rangePicker.open}
        onClose={rangePicker.onClose}
        selected={rangePicker.selected}
        error={rangePicker.error}
      />
    </Stack>
  ) 

  const renderPriority = (
    <Stack direction="row" alignItems="center">
      <StyledLabel>Öncelik</StyledLabel>

      <KanbanDetailsPriority
        priority={priority}
        onChangePriority={handleChangePriority}
      />
    </Stack>
  )

  const renderDescription = (
    <Stack direction="row">
      <StyledLabel sx={{ height: 24, lineHeight: "38px"}}> Açıklama </StyledLabel>

      <TextField
        fullWidth
        multiline
        size="small"
        value={taskDescription}
        InputProps={{
          sx: { typography: "body2" }
        }}
      />
    </Stack>
  )

  const renderAttachments = (
    <Stack direction="row">
      <StyledLabel sx={{ height: 24, lineHeight: "60px" }}>Dosyalar</StyledLabel>
      <KanbanDetailsAttachments attachments={task.attachments} /> 
    </Stack>
  );

  const renderComments = <KanbanDetailsCommentList comments={task.comments} />

  return (
    <Drawer
    open={openDetails}
    onClose={onCloseDetails}
    anchor="right"
    slotProps={{
      backdrop: { invisible: true }
    }}
    PaperProps={{
      sx: {
        width: {
          xs: 1,
          sm: 500
        },
        bgcolor: "#D0F1E9" // Set the background color to #47474e
      }
    }}
  >
    {renderHead}
  
    <Divider />
  
    <Box
      sx={{
        height: 1,
        display: "flex",
        flexDirection: "column",
        overflow: 'auto' // Scroll özelliğini aktif hale getiriyoruz
      }}
    >
      <Stack
        spacing={2}
        sx={{
          pt: 3,
          pb: 5,
          px: 2.5
        }}
      >
        {renderName}
  
        {renderReporter}
  
        {renderAssignee}
  
        {renderLabel}
  
        {renderDueDate}
  
        {renderPriority}
  
        {renderDescription}

        {renderAttachments}
      </Stack>
  
      {!!task.comments.length && renderComments}
    </Box>
  
    <KanbanDetailsCommentInput task={task} />

    </Drawer>
  );
}