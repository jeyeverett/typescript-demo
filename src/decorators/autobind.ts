export default function Autobind(
  _: any,
  _2: string,
  descriptor: PropertyDescriptor
) {
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
