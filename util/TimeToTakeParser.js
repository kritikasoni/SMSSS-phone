export function tttParse(timeToTake, overrideTtt) {
  if (timeToTake.length <= 0) {
    return [];
  }
  overrideTtt = overrideTtt ? overrideTtt : defaultTimeToTake;
  const tttList = _tttMatcher(timeToTake);
  return tttList.map(ttt => overrideTtt.find(t => t.period === ttt.period));
}

function _tttMatcher(timeToTake){
  switch (timeToTake.period){
    case 'morning|afternoon(before meal)':
      return [
        { period: 'morning (before meal)' },
        { period: 'afternoon (before meal)' }
      ];
    case 'morning|afternoon(after meal)':
      return [
        { period: 'morning (after meal)' },
        { period: 'afternoon (after meal)' }
      ];
    case 'morning|evening (before meal)':
      return [
        { period: 'morning (before meal)' },
        { period: 'evening (before meal)' }
      ];
    case 'morning|evening (after meal)':
      return [
        { period: 'morning (before meal)' },
        { period: 'evening (after meal)' }
      ];
    case 'morning(before meal)|before sleeping ':
      return [
        { period: 'morning (before meal)' },
        { period: 'before sleeping' }
      ];
    case 'morning(after meal)|before sleeping ':
      return [
        { period: 'morning (after meal)' },
        { period: 'before sleeping' }
      ];
    case 'morning|afternoon|evening (before meal)':
      return [
        { period: 'morning (before meal)' },
        { period: 'afternoon (before meal)' },
        { period: 'evening (before meal)' }
      ];
    case 'morning|afternoon|evening (after meal)':
      return [
        { period: 'morning (after meal)' },
        { period: 'afternoon (after meal)' },
        { period: 'evening (after meal)' }
      ];
    case 'morning|afternoon|evening|(before meal)|before sleeping':
      return [
        { period: 'morning (before meal)' },
        { period: 'afternoon (before meal)' },
        { period: 'evening (before meal)' },
        { period: 'before sleeping' }
      ];
    case 'morning|afternoon|evening|(after meal)|before sleeping':
      return [
        { period: 'morning (after meal)' },
        { period: 'afternoon (after meal)' },
        { period: 'evening (after meal)' },
        { period: 'before sleeping' }
      ];
    case 'afternoon|evening (before meal)':
      return [
        { period: 'afternoon (before meal)' },
        { period: 'evening (before meal)' }
      ];
    case 'afternoon (before meal)|before sleeping':
      return [
        { period: 'morning (before meal)' },
        { period: 'before sleeping' }
      ];
    case 'afternoon (after meal)|before sleeping':
      return [
        { period: 'afternoon (after meal)' },
        { period: 'before sleeping' }
      ];
    case 'afternoon|evening (before meal)|before sleeping':
      return [
        { period: 'afternoon (before meal)' },
        { period: 'evening (before meal)' },
        { period: 'before sleeping' }
      ];
    case 'afternoon|evening (after meal)|before sleeping':
      return [
        { period: 'afternoon (after meal)' },
        { period: 'before sleeping' }
      ];
    case 'evening(before meal)|before sleeping':
      return [
        { period: 'evening (before meal)' },
        { period: 'before sleeping' }
      ];
    case 'evening(after meal)|before sleeping':
      return [
        { period: 'evening (after meal)' },
        { period: 'before sleeping' }
      ];
    default:
      return [timeToTake];
  }
}
export const defaultTimeToTake = [
  { id: 1, period: 'morning (before meal)', time: '7:00'},
  { id: 2, period: 'morning (after meal)', time: '7:30' },
  { id: 3, period: 'afternoon (before meal)', time: '11:30' },
  { id: 4, period: 'afternoon (after meal)', time: '12:30'},
  { id: 5, period: 'evening (before meal)' , time: '17:30'},
  { id: 6, period: 'evening (after meal)' , time: '18:30'},
  { id: 7, period: 'before sleeping', time: '23:00'}
];
