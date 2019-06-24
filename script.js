

/**
 *  1. Long comment start
 *  2. Long comment body
 *  3. Comment end
 *  4. Class line
 *  5. Constructor
 *  6. Method
 *  7. Variable
 *  8. Method call
 *  9. Function end
 */

  //             1.       2.           3.          4.                  5.                 6.                   7.                8.              9.
// const layer1 = /(?<comment_head>\/\*\*)|(?<comment_body> *\*[^/].*)|(?<comment_tail> *\*\/ *)|^([ \w]*class \w+.*)|( *constructor.*)|^( *[a-z]\w*\(.*\).*)|( *(const|let) \w+.+)|( *\w+\.\w+\(.*)|( *[}{])/;

const commentHeadLayer1 = new RegExp(/(?<comment_head>\/\*\*)/);
const commentBodyLayer1 = new RegExp(/(?<comment_body> *\*[^/].*)/);
const commentTailLayer1 = new RegExp(/(?<comment_tail> *\*\/ *)/);

const classDefLayer1 = new RegExp(/^(?<class_def>[ \w]*class \w+.*)/);

const constructorDefLayer1 = new RegExp(/(?<constructor_def> *constructor.*)/);

const methodDefLayer1 = new RegExp(/^(?<method_def> *[a-z]\w*\(.*\).*)/);

const variableDefLayer1 = new RegExp(/(?<variable_def> *(const|let) \w+.+)/);

const methodCallLayer1 = new RegExp(/(?<method_call> *\w+\.\w+\(.*)/);

const functionScopeLayer1 = new RegExp(/(?<functionScope>[}{])/);

const layer1 = new RegExp(
  commentHeadLayer1.source + '|' +
  commentBodyLayer1.source + '|' +
  commentTailLayer1.source + '|' +
  classDefLayer1.source + '|' +
  constructorDefLayer1.source + '|' +
  methodDefLayer1.source + '|' +
  variableDefLayer1.source + '|' +
  methodCallLayer1.source + '|' +
  functionScopeLayer1.source
);

const commentBody = /( *)(\*)( *)(.*)/;

const self = t => t;
const assignComment = g => g.klass = 'ts-comment';

const createCodeLine = (line) => {
  let lineItem = { type: 'EPSILON', group: '' };

  if (line) {
    let match = layer1.exec(line);

    console.log('----------------------', match);

    if (match) {

      match = match.splice(1);

      const defined = match.map((g, i) => {
        i++;

        let type = i === 1  ? 'COMMENT_HEAD' :
                   i === 2  ? 'COMMENT_BODY' :
                   i === 3  ? 'COMMENT_TAIL' :
                   i === 4  ? 'CLASS_DEFINITION' :
                   i === 5  ? 'CONSTRUCTOR_DEFINITION' :
                   i === 6  ? 'METHOD_DEFINITION' :
                   i === 7  ? 'VARIABLE_DEFINITION' :
                   i === 8  ?  null:
                   i === 9  ? 'METHOD_CALL' :
                   i === 10 ? 'FUNCTION_END' :
                              'UNKNOWN';

        return {type, group: g}
      });

      lineItem = defined.filter(e => e.type && e.group);
    }
  }

  return lineItem;
};

init();

function init() {
  const body = `
/**
 * Common logging class to extend.
 */
export class FileAware {

  constructor(private className: string) {}

  log(methodName: string, ...args) {
    const spacer = args && args.length > 0 ? ' --- ' : '';

    console.log(\`\${this.className}.\${methodName}\${spacer}\`, ...args);
  }

  logTable(methodName: string, tableName: string, data: any[]) {
    this.log(methodName);
    console.groupCollapsed(tableName);
    console.table(data);
    console.groupEnd();
  }
}

`;

  const lines = body.split('\n');

  let elements = lines.map(line => {
    const elements = createCodeLine(line);

    console.groupCollapsed(line);
    console.table(elements);
    console.groupEnd();

    return elements[0];
  });

  console.table(elements);

  elements = runParser(elements.filter(e => e && e.type));

  elements.forEach(el => console.log(el));

  // console.log = () => {
  // };

// const commentStart = /(\/\*{1,2})/;
// console.log(commentStart, commentStart.exec(body));
//

//
// const commentEnd = /( )(\*\/)/;
// console.log(commentEnd, commentEnd.exec(body));
//
// const classArea = /(export)( )(class)( )(\w+)( )({)/;
// console.log(classArea, classArea.exec(body));
//
// const constructorArea = /( +)(constructor)(\()(private) (\w+)(:) (\w+)(\)) ({})/;
// console.log(constructorArea, constructorArea.exec(body));
//
// const methodOneLine = /( +)(\w+)(\()(\w+)(:)( )(\w+)(,)( )(\.*)(\w+)(\))( )({)/;
// console.log(methodOneLine, methodOneLine.exec(body));
//
// const firstLogLine = /( +)(const)( )(\w+)( )(=)( )(\w+)( )(&&)( )(\w+)(.)(\w+)( )(>)( )(0)( )(\?)( )(')( )(---)( )(')( )(:)( )('')(;)/
// console.log(firstLogLine, firstLogLine.exec(body));
//
// const secondLogLine = /( +)(\w+)(.)(\w+)(\()(`)(\$)({)(this)(.)(\w+)(})(.)(\$)({)(\w+)(})(\$)({)(\w+)(})(`)(,)( )(.{3})(\w+)(\))(;)/;
// console.log(secondLogLine, secondLogLine.exec(body));
//
// const methodEnd = /( +)(})/;
// console.log(methodEnd, methodEnd.exec(body));
//
// const methodOneLineTwo = /( +)(\w+)(\()(\w+)(:)( )(\w+)(,)( )(\w+)(:)( )(\w+)(,)( )(\w+)(:)( )(\w+)(\[])(\))( )({)/;
// console.log(methodOneLineTwo, methodOneLineTwo.exec(body));
//
// const innerMethodCallLine = /( +)(\w+)(.)(\w+)(\()(\w*)(\))(;)/;
// console.log(innerMethodCallLine, innerMethodCallLine.exec(body));
}

function runParser(elements) {
  return elements.map(element => {
    element.type === 'COMMENT_HEAD' ? element.klass = 'ts-comment' :
      element.type === 'COMMENT_BODY' ? breakDownElement(element, commentBody, self, assignComment, self, assignComment) :
        'default';

    return element;
  });
}

function breakDownElement(element, regex, ...groupFns) {
  const groups = regex.exec(element.group);
  console.log('-------------------------------', element, regex, groups);

  return Array.from(Array(groups.length).map(i => groupFns[i](groups[i])));
}

