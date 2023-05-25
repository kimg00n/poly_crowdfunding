/* eslint-disable */
import Web3 from 'web3';

if (window.ethereum) {
  window.web3 = new Web3(ethereum);
  try {
    // Request account access if needed
    ethereum.enable();
  } catch (error) {
    // User denied account access...
  }
} else if (window.web3) {
  // Legacy dapp browsers...
  window.web3 = new Web3(web3.currentProvider);
} else {
  // Non-dapp browsers...
  alert("메타마스크가 설치되어 있지 않습니다. 메타마스크를 설치해주세요.");
  window.location.href = "https://metamask.io/";
}

export default web3;