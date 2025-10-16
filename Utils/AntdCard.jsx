import { Button, Card, Typography } from 'antd'
import React from 'react'
import {
    UserOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ProjectOutlined,
    CaretUpOutlined,
    PlusOutlined,
    EditOutlined
} from "@ant-design/icons";

const AntdCard = ({
    title = "Card Title",
    titleSize = 4,
    titleChild,
    isExtra = false,
    cardBody,
    onClick
}) => {
    return (
        <Card
            style={{
                padding: "5px 10px",
                borderRadius: "8px",
                width: "100%",
                height: "100%",
            }}
            title={
                <div className="flex items-center gap-2">
                    <Typography.Title level={titleSize}>{title}</Typography.Title>
                    {titleChild && (
                        <Typography.Text type="secondary">({titleChild})</Typography.Text>
                    )}
                </div>
            }
            bordered={false}
            extra={
                isExtra && (
                    <Button type="text" onClick={onClick} style={{ fontSize: "18px" }}>
                        <EditOutlined />
                    </Button>
                )
            }
        >
            {cardBody}
        </Card>
    );
};

export default AntdCard;

