// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaaSProductBirth {

    struct ProductBirth {
        string gpid;
        string brand;
        string model;
        string category;
        string factory;
        string batch;
        uint256 createdAt;
        address creator;
        bytes32 fingerprint;
    }

    mapping(string => ProductBirth) private products;

    event ProductBorn(
        string gpid,
        string brand,
        string model,
        address creator
    );

    function birthProduct(
        string memory _gpid,
        string memory _brand,
        string memory _model,
        string memory _category,
        string memory _factory,
        string memory _batch,
        bytes32 _fingerprint
    ) public {
        require(bytes(products[_gpid].gpid).length == 0, "Already exists");

        products[_gpid] = ProductBirth({
            gpid: _gpid,
            brand: _brand,
            model: _model,
            category: _category,
            factory: _factory,
            batch: _batch,
            createdAt: block.timestamp,
            creator: msg.sender,
            fingerprint: _fingerprint
        });

        emit ProductBorn(_gpid, _brand, _model, msg.sender);
    }

    function getProduct(string memory _gpid)
        public
        view
        returns (ProductBirth memory)
    {
        require(bytes(products[_gpid].gpid).length != 0, "Not found");
        return products[_gpid];
    }
}