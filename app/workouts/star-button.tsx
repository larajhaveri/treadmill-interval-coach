import { setStar } from "./star-actions";

// A star toggle. Tapping it stars the workout, or un-stars it if it is already starred.
export default function StarButton({
  workoutId,
  starred,
  labeled = false,
}: {
  workoutId: string;
  starred: boolean;
  labeled?: boolean;
}) {
  return (
    <form action={setStar.bind(null, workoutId, !starred)}>
      <button
        type="submit"
        className={labeled ? "btn btn-plain" : "star-btn"}
        aria-pressed={starred}
        aria-label={starred ? "Remove star" : "Star this workout"}
      >
        <span aria-hidden="true">{starred ? "★" : "☆"}</span>
        {labeled && (starred ? " Starred" : " Star")}
      </button>
    </form>
  );
}
