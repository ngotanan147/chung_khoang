export function selectColor(num: number) {
  switch (true) {
    case num >= 100:
      return 'purple';
    case num >= 50:
      return 'orange';
    case num > 0:
      return 'green';
    case num == 0:
      return '';
    case num < 0:
      return 'red';
    default:
      return '';
  }
}
