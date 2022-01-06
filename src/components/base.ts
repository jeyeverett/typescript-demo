export default abstract class Component<
  T extends HTMLElement,
  U extends HTMLElement
> {
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
