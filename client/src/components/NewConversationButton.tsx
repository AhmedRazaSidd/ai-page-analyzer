interface NewConversationButtonProps {
  onClick: () => void;
}

function NewConversationButton({ onClick }: NewConversationButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
    >
      <span>+</span>
      New conversation
    </button>
  );
}

export default NewConversationButton;
