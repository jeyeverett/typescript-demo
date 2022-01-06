import ProjectList from "./components/project-list.js";
import ProjectInput from "./components/project-input.js";
import { ProjectStatus } from "./models/project.js";

new ProjectInput();
new ProjectList(ProjectStatus.Active);
new ProjectList(ProjectStatus.Completed);
