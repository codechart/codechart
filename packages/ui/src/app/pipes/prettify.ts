import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'prettify',
})
export class PrettifyPipe implements PipeTransform {
  public transform(input: string): string {
    if (!input) return input
    input = input.replace(/_/g, ' ')
    input = input.replace(/-/g, ' ')
    return input
      .toLowerCase()
      .split(' ')
      .map((part) => {
        // convert camel case to title case
        part = part.replace(/([A-Z])/g, ' $1')
        return part.charAt(0).toUpperCase() + part.slice(1)
      })
      .join(' ')
  }
}
