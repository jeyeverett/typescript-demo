import ProjectList from "./components/project-list";
import ProjectInput from "./components/project-input";
import { ProjectStatus } from "./models/project";

new ProjectInput();
new ProjectList(ProjectStatus.Active);
new ProjectList(ProjectStatus.Completed);
