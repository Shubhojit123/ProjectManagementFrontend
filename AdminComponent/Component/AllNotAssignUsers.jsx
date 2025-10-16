import React, { useState, useEffect } from "react";
import { useAdmin } from "../AdminContext";
import { message, Badge, Avatar, Tooltip, Button } from "antd";
import {
    UserOutlined,
    TeamOutlined,
    SearchOutlined,
    CheckCircleOutlined,
    UserAddOutlined,
    DownOutlined,
    CheckOutlined,
    CloseOutlined
} from "@ant-design/icons";

function AllNotAssignUsers() {
    const [members, setMembers] = useState([]);
    const [managers, setManagers] = useState([]);
    const [selectedManager, setSelectedManager] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDropdownUser, setShowDropdownUser] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [isLoading, setIsLoading] = useState(false);

    const { getAllNotAssignUsers, getAllManagers, assignUsersToManager } = useAdmin();

    // fetch not assigned users
    const fetchAllUsers = async () => {
        try {
            setIsLoading(true);
            const res = await getAllNotAssignUsers();
            setMembers(res.data.message);
        } catch (error) {
            console.log(error);
            messageApi.error("Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    // fetch managers
    const fetchAllManagers = async () => {
        try {
            const res = await getAllManagers();
            setManagers(res.data.message);
        } catch (error) {
            console.log(error);
            messageApi.error("Failed to fetch managers");
        }
    };

    useEffect(() => {
        fetchAllUsers();
        fetchAllManagers();
    }, []);

    // toggle select/unselect user
    const handleUserSelect = (userId) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleAssign = async () => {
        if (!selectedManager) return messageApi.error("Please select a Manager");
        if (selectedUsers.length === 0) return messageApi.error("Please select at least one User");
        
        try {
            setIsLoading(true);
            const managerId = selectedManager._id;
            const userId = selectedUsers;

            await assignUsersToManager(managerId, userId);
            messageApi.success("Users assigned successfully");
            await fetchAllUsers();
            setSelectedUsers([]);
            setSelectedManager(null);
        } catch (error) {
            console.log(error);
            messageApi.error(error.response?.data?.message || "Failed to assign");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearSelection = () => {
        setSelectedUsers([]);
        setSelectedManager(null);
    };

    const filteredMembers = members?.filter((member) =>
        member.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-[600px] bg-gradient-to-br from-gray-900/50 via-black/50 to-gray-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-white">
            {contextHolder}
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <UserAddOutlined className="text-white text-xl" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Assign Users to Manager
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Connect unassigned users with their managers
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-3">
                    <Badge count={filteredMembers?.length || 0} showZero color="#6366f1">
                        <div className="w-10 h-10 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center">
                            <UserOutlined className="text-white/70" />
                        </div>
                    </Badge>
                    <Badge count={managers?.length || 0} showZero color="#10b981">
                        <div className="w-10 h-10 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center">
                            <TeamOutlined className="text-white/70" />
                        </div>
                    </Badge>
                </div>
            </div>

            {/* Manager Selection */}
            <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                    <TeamOutlined className="text-blue-400" />
                    <p className="text-sm font-medium text-gray-300">Select Manager</p>
                </div>
                
                <div className="relative">
                    <div
                        className="group bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 cursor-pointer hover:border-blue-500/50 hover:bg-black/60 transition-all duration-300"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div className="flex items-center justify-between">
                            {selectedManager ? (
                                <div className="flex items-center space-x-3">
                                    <Avatar
                                        size={40}
                                        src={selectedManager.profileImage}
                                        className="border-2 border-blue-500/30"
                                    >
                                        {selectedManager.username[0]?.toUpperCase()}
                                    </Avatar>
                                    <div>
                                        <span className="text-white font-medium">{selectedManager.username}</span>
                                        <p className="text-blue-400 text-xs">{selectedManager.role}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-600/50 rounded-full flex items-center justify-center">
                                        <TeamOutlined className="text-gray-400" />
                                    </div>
                                    <span className="text-gray-400">Choose a manager...</span>
                                </div>
                            )}
                            
                            <DownOutlined 
                                className={`text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} 
                            />
                        </div>
                    </div>

                    {showDropdown && (
                        <div className="absolute mt-2 w-full max-h-60 overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl z-20 shadow-2xl scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                            {managers && managers.length > 0 ? (
                                <div className="p-2 space-y-1">
                                    {managers.map((manager) => (
                                        <div
                                            key={manager._id}
                                            className="flex items-center p-3 hover:bg-blue-600/20 cursor-pointer rounded-lg transition-all duration-200 group"
                                            onClick={() => {
                                                setSelectedManager(manager);
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <Avatar
                                                size={36}
                                                src={manager.profileImage}
                                                className="border-2 border-white/10 group-hover:border-blue-500/50 transition-all duration-200"
                                            >
                                                {manager.username[0]?.toUpperCase()}
                                            </Avatar>
                                            <div className="ml-3">
                                                <span className="text-white font-medium block">{manager.username}</span>
                                                <span className="text-blue-400 text-xs">{manager.role}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center">
                                    <TeamOutlined className="text-4xl text-gray-500 mb-2" />
                                    <p className="text-gray-400 text-sm">No managers available</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="flex items-center space-x-2 mb-3">
                    <SearchOutlined className="text-green-400" />
                    <p className="text-sm font-medium text-gray-300">Search & Select Users</p>
                    {selectedUsers.length > 0 && (
                        <Badge count={selectedUsers.length} className="ml-2" />
                    )}
                </div>
                
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search users by name..."
                        className="w-full p-4 pl-12 pr-4 rounded-xl text-white bg-black/40 backdrop-blur-sm border border-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <SearchOutlined className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Users Selection */}
            <div className="mb-6">
                <div
                    className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 cursor-pointer hover:border-green-500/50 hover:bg-black/60 transition-all duration-300"
                    onClick={() => setShowDropdownUser(!showDropdownUser)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                <UserOutlined className="text-green-400" />
                            </div>
                            <div>
                                {selectedUsers.length > 0 ? (
                                    <div>
                                        <span className="text-white font-medium">
                                            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                                        </span>
                                        <p className="text-green-400 text-xs">Ready for assignment</p>
                                    </div>
                                ) : (
                                    <span className="text-gray-400">Select users to assign...</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            {selectedUsers.length > 0 && (
                                <Tooltip title="Clear selection">
                                    <Button
                                        type="text"
                                        icon={<CloseOutlined />}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-none"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedUsers([]);
                                        }}
                                    />
                                </Tooltip>
                            )}
                            <DownOutlined 
                                className={`text-gray-400 transition-transform duration-300 ${showDropdownUser ? 'rotate-180' : ''}`} 
                            />
                        </div>
                    </div>
                </div>

                {showDropdownUser && (
                    <div className="mt-2 max-h-80 overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                                <p className="text-gray-400">Loading users...</p>
                            </div>
                        ) : filteredMembers && filteredMembers.length > 0 ? (
                            <div className="p-2 space-y-1">
                                {filteredMembers.map((member) => {
                                    const isSelected = selectedUsers.includes(member._id);
                                    return (
                                        <div
                                            key={member._id}
                                            onClick={() => handleUserSelect(member._id)}
                                            className={`flex items-center justify-between p-3 cursor-pointer rounded-lg transition-all duration-200 group ${
                                                isSelected 
                                                    ? 'bg-green-500/20 border border-green-500/30' 
                                                    : 'hover:bg-white/5 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <Avatar
                                                        size={44}
                                                        src={member.profileImage}
                                                        className={`border-2 transition-all duration-200 ${
                                                            isSelected 
                                                                ? 'border-green-500/70' 
                                                                : 'border-white/20 group-hover:border-white/40'
                                                        }`}
                                                    >
                                                        {member.username[0]?.toUpperCase()}
                                                    </Avatar>
                                                    {isSelected && (
                                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                            <CheckOutlined className="text-white text-xs" />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div>
                                                    <p className="font-medium text-white group-hover:text-green-300 transition-colors">
                                                        {member.username}
                                                    </p>
                                                    <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                                                        {member.role}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                                isSelected 
                                                    ? 'bg-green-500 border-green-500' 
                                                    : 'border-gray-500 group-hover:border-green-400'
                                            }`}>
                                                {isSelected && <CheckOutlined className="text-white text-xs" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <UserOutlined className="text-4xl text-gray-500 mb-3" />
                                <p className="text-gray-400">
                                    {searchTerm ? 'No users match your search' : 'No unassigned users found'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-400">
                        {selectedUsers.length > 0 && selectedManager ? (
                            <span className="flex items-center space-x-2">
                                <CheckCircleOutlined className="text-green-400" />
                                <span>Ready to assign {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} to {selectedManager.username}</span>
                            </span>
                        ) : (
                            <span>Select manager and users to proceed</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {(selectedUsers.length > 0 || selectedManager) && (
                        <Button
                            onClick={handleClearSelection}
                            className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300"
                        >
                            <CloseOutlined className="mr-2" />
                            Clear All
                        </Button>
                    )}
                    
                    <Button
                        onClick={handleAssign}
                        disabled={!selectedManager || selectedUsers.length === 0 || isLoading}
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                            selectedManager && selectedUsers.length > 0 && !isLoading
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                                : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Assigning...</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <UserAddOutlined />
                                <span>Assign Users</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default AllNotAssignUsers;