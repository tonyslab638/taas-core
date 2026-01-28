// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaaSProductBirth {

    struct Product {
        string gpid;
        string brand;
        string model;
        string category;
        string factory;
        string batch;
        uint256 bornAt;
        address issuer;
        bytes32 hash;
    }

    mapping(string => Product) private products;
    mapping(string => bool) public exists;

    // Ownership & Security
    mapping(string => address) public owner;
    mapping(string => bool) public stolen;

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyOwner(string memory gpid) {
        require(owner[gpid] == msg.sender, "Not owner");
        _;
    }

    // ===== CORE BIRTH =====
    function birthProduct(
        string memory gpid,
        string memory brand,
        string memory model,
        string memory category,
        string memory factory,
        string memory batch,
        bytes32 hash
    ) public {
        require(!exists[gpid], "Already exists");

        products[gpid] = Product({
            gpid: gpid,
            brand: brand,
            model: model,
            category: category,
            factory: factory,
            batch: batch,
            bornAt: block.timestamp,
            issuer: msg.sender,
            hash: hash
        });

        exists[gpid] = true;
    }

    // ===== READ LAYERS =====

    function getCore(string memory gpid) public view returns (
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory
    ) {
        require(exists[gpid], "Not found");
        Product memory p = products[gpid];
        return (
            p.gpid,
            p.brand,
            p.model,
            p.category,
            p.factory,
            p.batch
        );
    }

    function getMeta(string memory gpid) public view returns (
        uint256,
        address,
        bytes32
    ) {
        require(exists[gpid], "Not found");
        Product memory p = products[gpid];
        return (
            p.bornAt,
            p.issuer,
            p.hash
        );
    }

    function getState(string memory gpid) public view returns (
        address,
        bool
    ) {
        require(exists[gpid], "Not found");
        return (
            owner[gpid],
            stolen[gpid]
        );
    }

    // ===== OWNERSHIP =====

    function assignOwner(string memory gpid, address newOwner) public {
        require(exists[gpid], "Not found");
        require(owner[gpid] == address(0), "Already owned");
        owner[gpid] = newOwner;
    }

    function transferOwner(string memory gpid, address newOwner) public onlyOwner(gpid) {
        owner[gpid] = newOwner;
    }

    function markStolen(string memory gpid) public onlyOwner(gpid) {
        stolen[gpid] = true;
    }

    function clearStolen(string memory gpid) public onlyOwner(gpid) {
        stolen[gpid] = false;
    }
}