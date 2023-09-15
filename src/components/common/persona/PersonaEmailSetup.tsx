import EmailBlocksPage from "@pages/EmailBlocksPage";

export default function PersonaEmailSetup(props: { personaId: number }) {
  return (
    <>
      <EmailBlocksPage personaId={props.personaId} />
    </>
  );
}
