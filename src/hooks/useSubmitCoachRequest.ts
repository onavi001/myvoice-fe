import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { requestCoach, requestCoachByCode } from "../store/coachSlice";
import { saveTrainingProfile } from "../store/trainingProfileSlice";
import { updateProfile } from "../store/userSlice";
import type { CoachRequestProfileForm } from "../utils/coachRequestProfile";

type CoachTarget =
  | { mode: "id"; coachId: string }
  | { mode: "code"; code: string };

export function useSubmitCoachRequest() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  const [submitting, setSubmitting] = useState(false);

  const submitCoachRequest = useCallback(
    async (target: CoachTarget, profile: CoachRequestProfileForm) => {
      if (!user) {
        throw new Error("Debes iniciar sesión");
      }

      setSubmitting(true);
      try {
        await dispatch(
          updateProfile({
            username: user.username,
            email: user.email,
            bio: profile.bio.trim(),
            goals: profile.goals.trim(),
            notes: profile.notes.trim(),
          })
        ).unwrap();

        await dispatch(saveTrainingProfile(profile.trainingProfile)).unwrap();

        if (target.mode === "id") {
          await dispatch(requestCoach(target.coachId)).unwrap();
        } else {
          await dispatch(requestCoachByCode(target.code)).unwrap();
        }
      } finally {
        setSubmitting(false);
      }
    },
    [dispatch, user]
  );

  return { submitCoachRequest, submitting };
}
