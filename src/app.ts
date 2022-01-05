enum ProjectStatus {
  Active = "active",
  Completed = "completed",
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

/* APPLICATION STATE MANAGEMENT */
type Listener<T> = (projects: T[]) => void;

class ProjectState {
  private static listeners: Listener<Project>[] = [];
  private static projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }

  static addListener(listenerFunc: Listener<Project>) {
    this.listeners.push(listenerFunc);
  }

  static addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString().slice(2),
      title,
      description,
      people,
      ProjectStatus.Active
    );

    this.projects.push(newProject);

    for (const listenerFunc of this.listeners) {
      listenerFunc([...this.projects]);
    }
  }
}

ProjectState.getInstance();

/* VALIDATION */
interface Validatable {
  value: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(input: Validatable) {
  const { value, required, minLength, maxLength, min, max } = input;
  let isValid = true;

  if (required) {
    isValid = isValid && value.trim().length !== 0;
  }

  if (minLength) {
    isValid = isValid && value.trim().length >= minLength;
  }

  if (maxLength) {
    isValid = isValid && value.trim().length <= maxLength;
  }

  if (min) {
    isValid = isValid && Number(value.trim()) >= min;
  }

  if (max) {
    isValid = isValid && Number(value.trim()) <= max;
  }

  return isValid;
}

function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const newDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false, //won't show up in a for loop
    get() {
      return originalMethod.bind(this);
    },
  };
  return newDescriptor;
}

/* COMPONENT BASE CLASS */
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    position: InsertPosition,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    ) as HTMLTemplateElement;

    this.hostElement = document.getElementById(hostElementId) as T;

    const element = document.importNode(this.templateElement.content, true);

    this.element = element.firstElementChild as U;

    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attachElement(position);
  }

  private attachElement(position: InsertPosition) {
    this.hostElement.insertAdjacentElement(position, this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

/* PROJECT LIST CLASS */
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  activeProjects: Project[] = [];

  constructor(private type: ProjectStatus) {
    super("project-list", "app", "beforeend", `${type}-projects`);
    this.configure();
    this.renderContent();
  }

  private renderProjects(status: ProjectStatus) {
    const ulElement = document.getElementById(
      `${status}-projects-list`
    ) as HTMLUListElement;

    ulElement.replaceChildren();

    for (const project of this.activeProjects) {
      const liElement = document.createElement("li");
      liElement.textContent = project.title;
      ulElement.appendChild(liElement);
    }
  }

  configure() {
    ProjectState.addListener((projects: Project[]) => {
      this.activeProjects = projects;
      this.renderProjects(ProjectStatus.Active);
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    (this.element.querySelector("ul") as HTMLUListElement).id = listId;
    (this.element.querySelector("h2") as HTMLHeadingElement).textContent = `${
      this.type[0].toUpperCase() + this.type.slice(1)
    } Projects`;
  }
}

/* PROJECT INPUT CLASS */
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", "afterbegin", "user-input");

    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}

  private getUserInput(): [string, string, string] | void {
    const { value: titleInput } = this.titleInputElement;
    const { value: descInput } = this.descInputElement;
    const { value: peopleInput } = this.peopleInputElement;

    const validTitle: Validatable = {
      value: titleInput,
      required: true,
    };

    const validDesc: Validatable = {
      value: descInput,
      required: true,
      minLength: 10,
      maxLength: 200,
    };

    const validPeople: Validatable = {
      value: peopleInput,
      required: true,
      min: 1,
      max: 10,
    };

    if (validate(validTitle) && validate(validDesc) && validate(validPeople)) {
      return [titleInput, descInput, peopleInput];
    } else {
      alert("Invalid input, please try again");
      return;
    }
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();

    const userInput = this.getUserInput();

    if (Array.isArray(userInput)) {
      const [titleInput, descInput, peopleInput] = userInput;
      ProjectState.addProject(titleInput, descInput, Number(peopleInput));
      this.clearInputs();
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descInputElement.value = "";
    this.peopleInputElement.value = "";
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList(ProjectStatus.Active);
const completedProjectList = new ProjectList(ProjectStatus.Completed);
