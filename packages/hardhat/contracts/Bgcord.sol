// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "base64-sol/base64.sol";

contract Bgcord is ERC721 {
	using Strings for uint256;
	using Strings for uint160;

	uint256 public totalSupply;
	uint256 public totalChannels;
	address public owner;

	struct Channel {
		uint256 id;
		string name;
	}

	mapping(uint256 => Channel) public channels;
	mapping(uint256 => mapping(address => bool)) public hasJoined;
	mapping(uint256 => uint256) public tokenToChannelId;

	modifier onlyOwner() {
		require(msg.sender == owner);
		_;
	}

	constructor(
		string memory _name,
		string memory _symbol
	) ERC721(_name, _symbol) {
		owner = msg.sender;
	}

	function createChannel(string memory _name) public onlyOwner {
		totalChannels++;
		channels[totalChannels] = Channel(totalChannels, _name);
	}

	function mint(uint256 _id) public payable {
		require(_id != 0);
		require(_id <= totalChannels);
		require(hasJoined[_id][msg.sender] == false);

		hasJoined[_id][msg.sender] = true;
		totalSupply++;

		tokenToChannelId[totalSupply] = _id;
		_safeMint(msg.sender, totalSupply);
	}

	function getChannel(uint256 _id) public view returns (Channel memory) {
		return channels[_id];
	}

	function renderTokenById(uint256 id) public view returns (string memory) {
		uint256 channelId = tokenToChannelId[id];
		Channel memory channel = channels[channelId];

		string memory render = string(abi.encodePacked());

		return render;
	}

	function generateSVGofTokenById(
		uint256 id
	) internal view returns (string memory) {
		string memory svg = string(
			abi.encodePacked(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="300" height="300" viewBox="0 0 880 880">',
				renderTokenById(id),
				"</svg>"
			)
		);
		return svg;
	}

	function getDescription(uint256 id) public view returns (string memory) {
		uint256 channelId = tokenToChannelId[id];
		Channel memory channel = channels[channelId];
		string memory desc = string(
			abi.encodePacked("Nft for ", channel.name, " channel")
		);
		return desc;
	}

	function tokenURI(uint256 id) public view override returns (string memory) {
		uint256 channelId = tokenToChannelId[id];
		Channel memory channel = channels[channelId];

		string memory name = string(
			abi.encodePacked("Bgcord #", id.toString())
		);

		string memory description = string(
			abi.encodePacked("Nft for ", channel.name, " channel")
		);
		string memory image = Base64.encode(bytes(generateSVGofTokenById(id)));

		return
			string(
				abi.encodePacked(
					"data:application/json;base64,",
					Base64.encode(
						bytes(
							abi.encodePacked(
								'{"name":"',
								name,
								'","description":"',
								description,
								'","external_url":"https://yourCollectible.com/token/',
								id.toString(),
								'","attributes":[{"trait_type":"Channel","value":"',
								channel.name,
								'"}], "owner":"',
								(uint160(ownerOf(id))).toHexString(20),
								'","image": "',
								"data:image/svg+xml;base64,",
								image,
								'"}'
							)
						)
					)
				)
			);
	}
}
