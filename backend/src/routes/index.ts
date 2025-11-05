import userRoutes from "./user.routes";
import goBagRoutes from "./goBag.routes";
import goBagItemRoutes from "./goBagItem.routes";
import moduleRoutes from "./module.routes";
import postRoutes from "./post.routes";
import quizRoutes from "./quiz.routes";
import ratingRoutes from "./rating.routes";
import quizAttemptRoutes from "./quizAttempt.routes";

export default [
  { path: "/users", router: userRoutes },
  { path: "/goBags", router: goBagRoutes },
  { path: "/items", router: goBagItemRoutes },
  { path: "/modules", router: moduleRoutes },
  { path: "/posts", router: postRoutes },
  { path: "/quiz", router: quizRoutes },
  { path: "/quiz-attempt", router: quizAttemptRoutes },
  { path: "/ratings", router: ratingRoutes },
];
