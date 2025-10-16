import React, { useState, useEffect } from "react";
import { Input, DatePicker, Select, Button, message, Avatar, Card, Form, Row, Col, Divider, Typography } from "antd";
import { useAdmin } from "../AdminContext";
import dayjs from "dayjs";
import {
  ProjectOutlined,
  CalendarOutlined,
  UserOutlined,
  SendOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CrownOutlined
} from "@ant-design/icons";
import "../Admin.css";

const { Title, Text } = Typography;

function CreateProject({ onSuccess }) {
    const [messageApi, contextHolder] = message.useMessage(); 
    const { createProject, getAllManagers } = useAdmin();
    const [form] = Form.useForm();
    
    const [projectName, setProjectName] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [manager, setManager] = useState("");
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const fetchAllManagers = async () => {
        try {
            const res = await getAllManagers();
            setManagers(res.data.message);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchAllManagers();
    }, []);

    const validateForm = () => {
        const errors = {};
        
        if (!projectName.trim()) errors.projectName = "Project name is required";
        if (!startDate) errors.startDate = "Start date is required";
        if (!endDate) errors.endDate = "End date is required";
        if (!manager) errors.manager = "Manager selection is required";
        
        if (startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
            errors.dateRange = "Start date must be before end date";
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            messageApi.error("Please fill all required fields correctly");
            return;
        }
        
        setLoading(true);
        try {
            const payLoad = {
                projectName,
                startDate,
                endDate,
                manager
            };

            await createProject(payLoad);
            messageApi.success("Project created successfully!");
            
            // Reset form
            setProjectName("");
            setStartDate(null);
            setEndDate(null);
            setManager("");
            setFormErrors({});
            form.resetFields();
            
            onSuccess?.();
        } catch (error) {
            console.log("Error:", error.response?.data?.message);
            messageApi.error(error.response?.data?.message || "Failed to create project");
        } finally {
            setLoading(false);
        }
    };

    const selectedManager = managers.find(m => m._id === manager);

    return (
        <div className="h-full bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl">
            {contextHolder}
            
            <Card
                className="h-full border-0 bg-transparent"
                bodyStyle={{ 
                    padding: '32px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <ProjectOutlined className="text-white text-xl" />
                    </div>
                    <div>
                        <Title level={3} className="!text-white !mb-1">
                            Create New Project
                        </Title>
                        <Text className="text-gray-400">
                            Set up your project details and assign a manager
                        </Text>
                    </div>
                </div>

                <Divider className="border-white/10 my-6" />

                <div className="flex-1 space-y-6">
                    {/* Project Name */}
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <ProjectOutlined className="text-purple-400" />
                            <Text className="text-white font-medium">Project Name</Text>
                        </div>
                        <Input
                            placeholder="Enter project name..."
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            size="large"
                            className="modern-input"
                            status={formErrors.projectName ? 'error' : ''}
                        />
                        {formErrors.projectName && (
                            <Text type="danger" className="text-xs">
                                {formErrors.projectName}
                            </Text>
                        )}
                    </div>

                    {/* Date Range */}
                    <Row gutter={16}>
                        <Col span={12}>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <CalendarOutlined className="text-green-400" />
                                    <Text className="text-white font-medium">Start Date</Text>
                                </div>
                                <DatePicker
                                    placeholder="Select start date"
                                    value={startDate ? dayjs(startDate) : null}
                                    onChange={(date) => setStartDate(date ? date.toISOString() : null)}
                                    size="large"
                                    className="w-full modern-datepicker"
                                    status={formErrors.startDate || formErrors.dateRange ? 'error' : ''}
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <ClockCircleOutlined className="text-orange-400" />
                                    <Text className="text-white font-medium">End Date</Text>
                                </div>
                                <DatePicker
                                    placeholder="Select end date"
                                    value={endDate ? dayjs(endDate) : null}
                                    onChange={(date) => setEndDate(date ? date.toISOString() : null)}
                                    size="large"
                                    className="w-full modern-datepicker"
                                    status={formErrors.endDate || formErrors.dateRange ? 'error' : ''}
                                />
                            </div>
                        </Col>
                    </Row>
                    
                    {formErrors.dateRange && (
                        <Text type="danger" className="text-xs block">
                            {formErrors.dateRange}
                        </Text>
                    )}

                    {/* Manager Selection */}
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <CrownOutlined className="text-amber-400" />
                            <Text className="text-white font-medium">Project Manager</Text>
                        </div>
                        <Select
                            showSearch
                            placeholder="Select a manager..."
                            optionFilterProp="children"
                            onChange={(value) => setManager(value)}
                            value={manager}
                            size="large"
                            className="w-full modern-select"
                            dropdownClassName="modern-select-dropdown"
                            status={formErrors.manager ? 'error' : ''}
                        >
                            {managers.map((member) => (
                                <Select.Option key={member._id} value={member._id}>
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center space-x-3">
                                            <Avatar
                                                size={32}
                                                src={member.profileImage}
                                                className="border border-white/20"
                                                style={{ backgroundColor: '#f59e0b' }}
                                            >
                                                {member.username?.[0]?.toUpperCase()}
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <Text className="text-white font-medium text-sm">
                                                    {member.username}
                                                </Text>
                                                <Text className="text-gray-400 text-xs">
                                                    {member.role || 'Manager'}
                                                </Text>
                                            </div>
                                        </div>
                                        <div
                                            className={`w-3 h-3 rounded-full ${
                                                member.userStatus 
                                                    ? "bg-green-400 animate-pulse shadow-lg shadow-green-400/50" 
                                                    : "bg-gray-500"
                                            }`}
                                        />
                                    </div>
                                </Select.Option>
                            ))}
                        </Select>
                        {formErrors.manager && (
                            <Text type="danger" className="text-xs">
                                {formErrors.manager}
                            </Text>
                        )}
                    </div>

                    {/* Selected Manager Preview */}
                    {selectedManager && (
                        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                            <Text className="text-gray-400 text-sm mb-3 block">Selected Manager:</Text>
                            <div className="flex items-center space-x-3">
                                <Avatar
                                    size={40}
                                    src={selectedManager.profileImage}
                                    className="border-2 border-amber-400/50"
                                    style={{ backgroundColor: '#f59e0b' }}
                                >
                                    {selectedManager.username?.[0]?.toUpperCase()}
                                </Avatar>
                                <div className="flex-1">
                                    <Text className="text-white font-medium block">
                                        {selectedManager.username}
                                    </Text>
                                    <Text className="text-amber-400 text-sm">
                                        {selectedManager.role || 'Manager'}
                                    </Text>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div
                                        className={`w-3 h-3 rounded-full ${
                                            selectedManager.userStatus 
                                                ? "bg-green-400 animate-pulse" 
                                                : "bg-gray-500"
                                        }`}
                                    />
                                    <Text className="text-xs text-gray-400">
                                        {selectedManager.userStatus ? 'Online' : 'Offline'}
                                    </Text>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-white/10">
                    <Button
                        type="primary"
                        size="large"
                        icon={<SendOutlined />}
                        onClick={handleSubmit}
                        loading={loading}
                        className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 border-none rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02]"
                    >
                        {loading ? 'Creating Project...' : 'Create Project'}
                    </Button>
                </div>
            </Card>

            {/* Custom Styles */}
            <style jsx global>{`
                .modern-input .ant-input {
                    background: rgba(0, 0, 0, 0.4) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: white !important;
                    border-radius: 12px !important;
                    padding: 12px 16px !important;
                    transition: all 0.3s ease !important;
                }
                
                .modern-input .ant-input:focus,
                .modern-input .ant-input-focused {
                    background: rgba(0, 0, 0, 0.6) !important;
                    border-color: rgba(139, 92, 246, 0.5) !important;
                    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1) !important;
                }
                
                .modern-input .ant-input::placeholder {
                    color: rgba(156, 163, 175, 0.8) !important;
                }

                .modern-datepicker .ant-picker {
                    background: rgba(0, 0, 0, 0.4) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: white !important;
                    border-radius: 12px !important;
                    padding: 8px 12px !important;
                }
                
                .modern-datepicker .ant-picker:hover,
                .modern-datepicker .ant-picker-focused {
                    border-color: rgba(139, 92, 246, 0.5) !important;
                    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1) !important;
                }

                .modern-select .ant-select-selector {
                    background: rgba(0, 0, 0, 0.4) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 12px !important;
                    padding: 4px 12px !important;
                    min-height: 48px !important;
                }
                
                .modern-select .ant-select-selection-placeholder {
                    color: rgba(156, 163, 175, 0.8) !important;
                }
                
                .modern-select-dropdown {
                    background: rgba(31, 31, 31, 0.95) !important;
                    backdrop-filter: blur(12px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 12px !important;
                }
                
                .modern-select-dropdown .ant-select-item {
                    color: white !important;
                    border-radius: 8px !important;
                    margin: 2px 4px !important;
                }
                
                .modern-select-dropdown .ant-select-item-option-selected {
                    background: rgba(139, 92, 246, 0.2) !important;
                }
                
                .modern-select-dropdown .ant-select-item:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
            `}</style>
        </div>
    );
}

export default CreateProject;