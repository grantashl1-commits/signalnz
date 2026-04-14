import { lazy, Suspense, useState } from "react";
import type { CourseActivity } from "@/data/connect-course";
import SignalRingAnimation from "@/components/SignalRingAnimation";

const SingleChoice = lazy(() => import("./activities/SingleChoice"));
const MultipleChoice = lazy(() => import("./activities/MultipleChoice"));
const TrueFalse = lazy(() => import("./activities/TrueFalse"));
const SortActivity = lazy(() => import("./activities/SortActivity"));
const FillBlanks = lazy(() => import("./activities/FillBlanks"));
const OpenResponse = lazy(() => import("./activities/OpenResponse"));
const ShortAnswer = lazy(() => import("./activities/ShortAnswer"));
const CarouselActivity = lazy(() => import("./activities/CarouselActivity"));
const DecisionPoint = lazy(() => import("./activities/DecisionPoint"));
const ComparisonActivity = lazy(() => import("./activities/ComparisonActivity"));
const SurveyActivity = lazy(() => import("./activities/SurveyActivity"));
const FindPairActivity = lazy(() => import("./activities/FindPairActivity"));
const MediaUpload = lazy(() => import("./activities/MediaUpload"));
const AttachmentQuiz = lazy(() => import("@/components/connect/AttachmentQuiz"));
const LoveLanguagesQuiz = lazy(() => import("@/components/connect/LoveLanguagesQuiz"));

const Loader = () => (
  <div className="flex justify-center py-8">
    <SignalRingAnimation variant="pulse" size={32} color="hsl(var(--primary))" />
  </div>
);

interface Props {
  activity: CourseActivity;
  onComplete: (activityId: string, response: any) => void;
}

export default function ActivityRenderer({ activity, onComplete }: Props) {
  const handle = (response: any) => onComplete(activity.id, response);
  const [quizOpen, setQuizOpen] = useState(false);

  // Full-screen quiz activities
  if (activity.type === "attachment_quiz" && quizOpen) {
    return <Suspense fallback={<Loader />}><AttachmentQuiz onBack={() => { setQuizOpen(false); handle({ completed: true }); }} /></Suspense>;
  }
  if (activity.type === "love_languages_quiz" && quizOpen) {
    return <Suspense fallback={<Loader />}><LoveLanguagesQuiz onClose={() => { setQuizOpen(false); handle({ completed: true }); }} /></Suspense>;
  }

  if (activity.type === "attachment_quiz" || activity.type === "love_languages_quiz") {
    return (
      <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          {activity.type === "attachment_quiz" 
            ? <span className="text-2xl">🧩</span>
            : <span className="text-2xl">💝</span>}
        </div>
        <h3 className="font-display text-lg font-bold text-foreground">{activity.title}</h3>
        <p className="text-sm text-muted-foreground">{activity.instruction}</p>
        <button
          onClick={() => setQuizOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loader />}>
      {(() => {
        switch (activity.type) {
          case "single_choice": return <SingleChoice content={activity.content} onComplete={handle} />;
          case "multiple_choice": return <MultipleChoice content={activity.content} onComplete={handle} />;
          case "true_false": return <TrueFalse content={activity.content} onComplete={handle} />;
          case "sort": return <SortActivity content={activity.content} onComplete={handle} />;
          case "fill_blanks": return <FillBlanks content={activity.content} onComplete={handle} />;
          case "open_response": return <OpenResponse content={activity.content} onComplete={handle} />;
          case "short_answer": return <ShortAnswer content={activity.content} onComplete={handle} />;
          case "carousel":
          case "info_carousel": return <CarouselActivity content={{ cards: activity.content?.slides?.map((s: any) => ({ title: s.heading, body: s.body })) || activity.content?.cards || [] }} onComplete={handle} />;
          case "decision_point": return <DecisionPoint content={activity.content} onComplete={handle} />;
          case "comparison": return <ComparisonActivity content={activity.content} onComplete={handle} />;
          case "survey": return <SurveyActivity content={activity.content} onComplete={handle} />;
          case "find_the_pair": return <FindPairActivity content={activity.content} onComplete={handle} />;
          case "image_upload": return <MediaUpload type="image_upload" content={activity.content} onComplete={handle} />;
          case "video_upload": return <MediaUpload type="video_upload" content={activity.content} onComplete={handle} />;
          default:
            return (
              <div className="p-4 rounded-xl bg-secondary text-center">
                <p className="font-body text-sm text-muted-foreground">Activity type "{activity.type}" coming soon</p>
              </div>
            );
        }
      })()}
    </Suspense>
  );
}
