import * as handlebars from 'handlebars';

export function registerHandlebarsHelpers() {
  // Equality comparison
  handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  // Not equal comparison
  handlebars.registerHelper('neq', function(a, b) {
    return a !== b;
  });

  // Greater than
  handlebars.registerHelper('gt', function(a, b) {
    return a > b;
  });

  // Less than
  handlebars.registerHelper('lt', function(a, b) {
    return a < b;
  });

  // Greater than or equal
  handlebars.registerHelper('gte', function(a, b) {
    return a >= b;
  });

  // Less than or equal
  handlebars.registerHelper('lte', function(a, b) {
    return a <= b;
  });

  // Conditional
  handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
    switch (operator) {
      case '==':
        return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
        return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '!=':
        return (v1 != v2) ? options.fn(this) : options.inverse(this);
      case '!==':
        return (v1 !== v2) ? options.fn(this) : options.inverse(this);
      case '<':
        return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
        return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      case '&&':
        return (v1 && v2) ? options.fn(this) : options.inverse(this);
      case '||':
        return (v1 || v2) ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  });

  // Format date
  handlebars.registerHelper('formatDate', function(date, format) {
    if (!date) return '';
    
    const dateObj = new Date(date);
    
    if (format === 'year') {
      return dateObj.getFullYear();
    } else if (format === 'iso') {
      return dateObj.toISOString();
    } else if (format === 'locale') {
      return dateObj.toLocaleString('da-DK', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
    
    return dateObj.toLocaleDateString();
  });

  // JSON stringify
  handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
  });
}
