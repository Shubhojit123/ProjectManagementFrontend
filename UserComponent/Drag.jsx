import React, { useState, useEffect } from "react";
import { Card, Tag, Modal, Input, Button, message } from "antd";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_URL;

function Drag({ values }) {
  const [data, setData] = useState(values || {});
  const [messageApi, contextHolder] = message.useMessage();
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    setData(values || {});
  }, [values]);

  let containerId;
  let startContainer;

  function handleDrag(e, id, startContainerName) {
    startContainer = startContainerName;
    containerId = id;
    e.target.style.opacity = "0.5";
  }

  function handleDragEnd(e) {
    e.target.style.opacity = "1";
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  async function handleDrop(e, container) {
    e.preventDefault();
    const putData = { state: container, taskId: containerId };

    try {
      await axios.put(`${BASE_URL}/user/update-task`, putData, { withCredentials: true });

      setData((prev) => {
        let draggedItem;
        const newData = Object.fromEntries(
          Object.entries(prev).map(([key, items]) => {
            const filtered = items.filter((item) => {
              if (item._id === containerId) {
                draggedItem = { ...item, state: container };
                return false;
              }
              return true;
            });
            return [key, filtered];
          })
        );

        if (draggedItem) {
          newData[container] = [...(newData[container] || []), draggedItem];
        }
        return newData;
      });

      if (startContainer !== container) {
        messageApi.success(`Moved to ${container} successfully`);
      }
    } catch (error) {
      messageApi.error("Failed to move task");
      console.error(error);
    }
  }

  const tagColors = {
    Pending: "orange",
    Process: "blue",
    Discuss: "purple",
    Complete: "green",
  };

  const openCommentModal = (task) => {
    setSelectedTask(task);
    setCommentText("");
    setCommentModalOpen(true);
  };

  const handleAddComment = async () => {
    if (!commentText) return;
    try {
      await axios.put(`${BASE_URL}/user/comment`, {
        taskId: selectedTask._id,
        comment: commentText,
      }, { withCredentials: true });

      messageApi.success("Comment added!");
      setCommentModalOpen(false);

      setData((prev) => {
        const newData = { ...prev };
        Object.keys(newData).forEach((key) => {
          newData[key] = newData[key].map((t) =>
            t._id === selectedTask._id
              ? { ...t, comments: [...(t.comments || []), commentText] }
              : t
          );
        });
        return newData;
      });
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to add comment");
    }
  };

  return (
    <div className="flex gap-4 p-4 h-[90vh]">
      {contextHolder}
      {/* {["Pending", "Process", "Discuss", "Complete"].map((container) => (
        <div
          key={container}
          className="flex-1 bg-gray-700 rounded-md p-2 flex flex-col overflow-y-auto"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, container)}
        >
          <h2 className="text-center font-bold mb-2 text-gray-100">{container}</h2>
          <div className="flex flex-col space-y-4 gap-2 overflow-y-auto" 
          style={{boxShadow:"0px 8px 32px gray"}}>
            {(data[container] || []).map((item) => (
              <Card
                key={item._id}
                draggable
                onDragStart={(e) => handleDrag(e, item._id, item.state)}
                onDragEnd={handleDragEnd}
                className="shadow-md cursor-move"
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <Tag color={tagColors[container]}>{container}</Tag>
                </div>
                <p>{item.description}</p>
                <p>
                  <b>Deadline:</b> {new Date(item.endDate).toLocaleDateString()}
                </p>
                <Button
                  size="small"
                  type="link"
                  onClick={() => openCommentModal(item)}
                >
                  Comments ({item.comments?.length || 0})
                </Button>
              </Card>
            ))}
          </div>
        </div>
      ))} */}

      {["Pending", "Process", "Discuss", "Complete"].map((container) => (
  <div
    key={container}
    className="flex-1 bg-black border border-gray-500 rounded-2xl p-6 flex flex-col overflow-hidden shadow-2xl hover:shadow-slate-700/50 transition-all duration-300"
    onDragOver={handleDragOver}
    onDrop={(e) => handleDrop(e, container)}
  >
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${
          container === 'Pending' ? 'bg-amber-500' : 
          container === 'Process' ? 'bg-blue-500' :
          container === 'Discuss' ? 'bg-purple-500' : 'bg-green-500'
        } shadow-lg`}></div>
        {container}
        <span className="bg-slate-700/50 text-slate-300 text-sm px-3 py-1 rounded-full font-normal">
          {(data[container] || []).length}
        </span>
      </h2>
    </div>

    <div 
      className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar" 
      style={{
        boxShadow: "inset 0 4px 20px rgba(0,0,0,0.3)",
        borderRadius: "12px",
        padding: "8px"
      }}
    >
      {(data[container] || []).map((item) => (
        <div
          key={item._id}
          draggable
          onDragStart={(e) => handleDrag(e, item._id, item.state)}
          onDragEnd={handleDragEnd}
          className="bg-gradient-to-r from-slate-700/90 to-slate-800/90 backdrop-blur-sm border
           border-slate-600/30 rounded-xl p-5 cursor-move 
           transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-900/40 
           hover:border-slate-500/50 group"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-white group-hover:text-blue-200 transition-colors">
              {item.title}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              container === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              container === 'Process' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
              container === 'Discuss' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
              'bg-green-500/20 text-green-300 border border-green-500/30'
            }`}>
              {container}
            </span>
          </div>
          
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            {item.description}
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">
                {new Date(item.endDate).toLocaleDateString()}
              </span>
            </p>
            
            <button 
              className="text-slate-400 hover:text-blue-300 text-sm font-medium flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-slate-700/50 transition-all duration-200"
              onClick={() => openCommentModal(item)}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              {item.comments?.length || 0}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
))}

      <Modal
        title={`Comments for: ${selectedTask?.title}`}
        open={commentModalOpen}
        onCancel={() => setCommentModalOpen(false)}
        footer={null}
      >
        <div className="flex flex-col gap-2">
          {(selectedTask?.comments || []).map((c, idx) => (
            <div key={idx} className="p-2 bg-gray-100 rounded">
              {c}
            </div>
          ))}
          <Input.TextArea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add your comment..."
          />
          <Button type="primary" block onClick={handleAddComment}>
            Add Comment
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Drag;
