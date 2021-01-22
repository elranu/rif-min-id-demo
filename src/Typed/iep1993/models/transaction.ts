export class Transaction {
    transactionHash!: string;
    transactionIndex!: number;
    blockHash!: string;
    blockNumber!: number;
    from!: string;
    to!: string;
    cumulativeGasUsed!: number;
    gasUsed!: number;
    contractAddress!: string;
    logs!: any[];
    logsBloom!: string;
    root!: string;
    status!: number;

    public static parse (txData: any) {
      const transaction = new Transaction()

      transaction.transactionHash = txData.transaction
      transaction.transactionIndex = parseInt(txData.transactionIndex, 16)
      transaction.blockHash = txData.blockHash
      transaction.from = txData.from
      transaction.to = txData.to
      transaction.cumulativeGasUsed = parseInt(txData.cumulativeGasUsed, 16)
      transaction.gasUsed = parseInt(txData.gasUsed, 16)
      transaction.contractAddress = txData.contractAddress
      transaction.logs = txData.logs
      transaction.logsBloom = txData.logsBloom
      transaction.root = txData.root
      transaction.blockNumber = parseInt(txData.blockNumber, 16)
      transaction.status = parseInt(txData.status, 16)

      return transaction
    }
}
