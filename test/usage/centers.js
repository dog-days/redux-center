export const delayTime = 200;
export async function incrementAsync(action, { put, delay }) {
  switch (action.type) {
    case 'INCREMENT_ASYNC':
      await delay(delayTime);
      await put({ type: 'INCREMENT' });
      break;
    default:
  }
}
