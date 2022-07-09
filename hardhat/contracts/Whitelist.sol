// SPDX-License-Identifier:MIT
pragma solidity ^0.8;

interface Whitelist {
    function whitelistedAddresses(address) external view returns(bool);
}                   