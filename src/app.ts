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
type Listener = (projects: Project[]) => void;

class ProjectState {
  private static listeners: Listener[] = [];
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

  static addListener(listenerFunc: Listener) {
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

/* PROJECT LIST CLASS */
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  activeProjects: Project[] = [];

  constructor(private type: "active" | "completed") {
    this.templateElement = document.getElementById(
      "project-list"
    ) as HTMLTemplateElement;
    this.hostElement = document.getElementById("app") as HTMLDivElement;

    const projectList = document.importNode(this.templateElement.content, true);

    this.element = projectList.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    ProjectState.addListener((projects: Project[]) => {
      this.activeProjects = projects;
      this.renderProjects(ProjectStatus.Active);
    });

    this.attachElement();
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

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    (this.element.querySelector("ul") as HTMLUListElement).id = listId;
    (this.element.querySelector("h2") as HTMLHeadingElement).textContent = `${
      this.type[0].toUpperCase() + this.type.slice(1)
    } Projects`;
  }

  private attachElement() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
}

/* PROJECT INPUT CLASS */
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    ) as HTMLTemplateElement;
    this.hostElement = document.getElementById("app") as HTMLDivElement;

    const inputForm = document.importNode(this.templateElement.content, true);

    this.element = inputForm.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";

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
    this.attachElement();
  }

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

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private attachElement() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const completedProjectList = new ProjectList("completed");
