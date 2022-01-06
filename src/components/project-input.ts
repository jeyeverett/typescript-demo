namespace App {
  /* PROJECT INPUT CLASS */
  export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

      if (
        validate(validTitle) &&
        validate(validDesc) &&
        validate(validPeople)
      ) {
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
}
