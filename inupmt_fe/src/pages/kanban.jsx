import { Helmet } from 'react-helmet-async';

import { KanbanView } from '../section/kanban/view';
// sections

// ----------------------------------------------------------------------

export default function KanbanPage() {
  return (
    <>
      <Helmet>
        <title> Özcan&Ucun : Kanban</title>
      </Helmet>

      <KanbanView />
    </>
  );
}
