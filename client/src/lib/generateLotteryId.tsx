function generateLotteryId(): number {
  const timestamp = Date.now(); 
  const random = Math.floor(Math.random() * 1000);
  return Number(`${timestamp}${random}`); 
}

export default generateLotteryId;