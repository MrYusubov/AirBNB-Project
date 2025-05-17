import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import Modal from "react-modal";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ClientSideRowModelModule } from "ag-grid-community";
import { ModuleRegistry } from "ag-grid-community";
import { useNavigate } from "react-router-dom";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

Modal.setAppElement("#root");

const ActionsCellRenderer = (props) => {
  const navigate = useNavigate();

  const deleteHouse = () => {
    if (props.context && props.context.deleteHouse) {
      props.context.deleteHouse(props.data.id);
    }
  };

  const openModal = () => {
    if (props.context && props.context.openModal) {
      props.context.openModal(props.data.id);
    }
  };

  const goToHouse = () => {
    navigate(`/houses/${props.data.id}`);
  };

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        onClick={goToHouse}
        style={{
          backgroundColor: "#5bc0de",
          color: "white",
          border: "none",
          padding: "5px 10px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Go To House
      </button>
      <button
        onClick={openModal}
        style={{
          backgroundColor: "#f0ad4e",
          color: "white",
          border: "none",
          padding: "5px 10px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Edit Price
      </button>
      <button
        onClick={deleteHouse}
        style={{
          backgroundColor: "#d9534f",
          color: "white",
          border: "none",
          padding: "5px 10px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Delete
      </button>
    </div>
  );
};

function HouseGrid({ houses, refreshHouses }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedHouseId, setSelectedHouseId] = useState(null);
    const [newPrice, setNewPrice] = useState("");
    const [confirmPrice, setConfirmPrice] = useState("");

    const deleteHouse = async (houseId) => {
        try {
            await axios.delete(`https://localhost:7149/api/Houses/${houseId}`, {
                withCredentials: true,
            });
            refreshHouses();
        } catch (error) {
            console.error("Error deleting house:", error);
        }
    };

    const openModal = (houseId) => {
        setSelectedHouseId(houseId);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setNewPrice("");
        setConfirmPrice("");
    };

    const updatePrice = async () => {
        if (newPrice !== confirmPrice) {
            alert("Prices do not match.");
            return;
        }

        try {
            await axios.patch(
                `https://localhost:7149/api/Houses/${selectedHouseId}/UpdatePrice`,
                { newPrice: parseFloat(newPrice) },
                { withCredentials: true }
            );
            closeModal();
            refreshHouses();
        } catch (error) {
            console.error("Error updating price:", error);
        }
    };

    const columnDefs = [
        { headerName: "Title", field: "title", flex: 1,      cellStyle: { 
            'display': 'flex',
            'align-items': 'center',
            'white-space': 'normal',
            'line-height': '1.5'
          }},
        { headerName: "Location", field: "location", flex: 1 },
        { headerName: "Price", field: "pricePerNight", flex: 1 },
        {
            headerName: "Actions",
            cellRenderer: ActionsCellRenderer,
            width: 350,
            suppressSizeToFit: true,
        },
    ];

    return (
        <div className="ag-theme-alpine" 
        style={{ 
            height: 700, 
            width: '100%',
            '--ag-row-height': '65px',
            '--ag-cell-horizontal-padding': '15px',
            '--ag-cell-vertical-padding': '15px',
            '--ag-font-size': '16px'
          }}>
            <AgGridReact 
                rowData={houses} 
                columnDefs={columnDefs}
                domLayout="autoHeight"
                modules={[ClientSideRowModelModule]}
                headerHeight={50}
                rowHeight={55}
                context={{
                    deleteHouse: deleteHouse,
                    openModal: openModal,
                    refreshHouses: refreshHouses
                }}
            />

            <Modal 
                isOpen={modalIsOpen} 
                onRequestClose={closeModal} 
                contentLabel="Edit Price"
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        width: '300px',
                        padding: '20px',
                    }
                }}
            >
                <h2 style={{ marginBottom: '15px' }}>Edit Price</h2>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="number"
                        placeholder="New Price"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                    <input
                        type="number"
                        placeholder="Confirm New Price"
                        value={confirmPrice}
                        onChange={(e) => setConfirmPrice(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                    <button 
                        onClick={closeModal} 
                        style={{
                            marginRight: '10px',
                            padding: '5px 15px',
                            backgroundColor: '#f0f0f0',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={updatePrice}
                        style={{
                            padding: '5px 15px',
                            backgroundColor: '#5cb85c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        OK
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default HouseGrid;