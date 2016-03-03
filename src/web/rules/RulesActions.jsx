import Reflux from 'reflux';

const RulesActions = Reflux.createActions({
  'delete': {asyncResult: true},
  'list': {asyncResult: true},
  'save': {asyncResult: true},
  'update': {asyncResult: true},
  'parse': {asyncResult: true},
  'multiple': {asyncResult: true},
});

export default RulesActions;