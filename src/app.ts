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

  private getUserInput(): [string, string, number] | void {
    const { value: titleInput } = this.titleInputElement;
    const { value: descInput } = this.descInputElement;
    const { value: peopleInput } = this.peopleInputElement;

    if (
      titleInput.trim().length === 0 ||
      descInput.trim().length === 0 ||
      peopleInput.trim().length === 0
    ) {
      alert("Invalid input, please try again");
      return;
    } else {
      return [titleInput, descInput, Number(peopleInput)];
    }
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();

    const userInput = this.getUserInput();

    if (Array.isArray(userInput)) {
      const [titleInput, descInput, peopleInput] = userInput;
      console.log(titleInput, descInput, peopleInput);
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
