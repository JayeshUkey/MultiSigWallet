// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract MultiSigWallet {
    event Deposit(address indexed sender, uint256 amount);
    event TransactionCreated(uint256 indexed txId, address indexed to, uint256 value, bytes data);
    event TransactionSigned(uint256 indexed txId, address indexed signer);
    event TransactionExecuted(uint256 indexed txId, address indexed executor);

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numSignatures;
    }

    address[] public signers;
    mapping(address => bool) public isSigner;
    mapping(uint256 => mapping(address => bool)) public isSigned;
    Transaction[] public transactions;
    uint256 public requiredSignatures;

    modifier onlySigner() {
        require(isSigner[msg.sender], "Not a signer");
        _;
    }

    modifier txExists(uint256 _txId) {
        require(_txId < transactions.length, "Transaction does not exist");
        _;
    }

    modifier notSigned(uint256 _txId) {
        require(!isSigned[_txId][msg.sender], "Transaction already signed");
        _;
    }

    modifier notExecuted(uint256 _txId) {
        require(!transactions[_txId].executed, "Transaction already executed");
        _;
    }

    constructor(address[] memory _signers, uint256 _requiredSignatures) {
        require(_signers.length > 0, "Signers required");
        require(_requiredSignatures > 0 && _requiredSignatures <= _signers.length, "Invalid number of required signatures");

        for (uint256 i = 0; i < _signers.length; i++) {
            address signer = _signers[i];
            require(signer != address(0), "Invalid signer");
            require(!isSigner[signer], "Signer not unique");

            isSigner[signer] = true;
            signers.push(signer);
        }

        requiredSignatures = _requiredSignatures;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function createTransaction(address _to, uint256 _value, bytes memory _data) public onlySigner {
        uint256 txId = transactions.length;

        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            numSignatures: 0
        }));

        emit TransactionCreated(txId, _to, _value, _data);
    }

    function signTransaction(uint256 _txId) public onlySigner txExists(_txId) notSigned(_txId) notExecuted(_txId) {
        Transaction storage transaction = transactions[_txId];
        transaction.numSignatures += 1;
        isSigned[_txId][msg.sender] = true;

        emit TransactionSigned(_txId, msg.sender);

        if (transaction.numSignatures >= requiredSignatures) {
            executeTransaction(_txId);
        }
    }

    function executeTransaction(uint256 _txId) internal txExists(_txId) notExecuted(_txId) {
        Transaction storage transaction = transactions[_txId];

        require(transaction.numSignatures >= requiredSignatures, "Not enough signatures");

        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Transaction failed");

        emit TransactionExecuted(_txId, msg.sender);
    }
}
