import React, {useState, useRef, useEffect} from 'react'
import styled from 'styled-components'

const MainCanvas = styled.div`
    display: flex;
    flex-direction: column;
    width: 60%;
    min-height: 100vh;
    border-left: 1px solid #999999;
    border-right: 1px solid #999999;
    padding: 1rem;
    .hidden {
        display: none;
    }

    .canvas_container {
        position: relative;
        display: inline-block;
        overflow-x: hidden;
        overflow-y: hidden;
        max-width: 100%;
    }
    .canvas {
        min-width: 100px;
        min-height: 100px;
    }
    .cropper {
        width: 100%;
        height:100%;
        position: absolute;
        top: 0;
        left: 0;
    }
    .crop_square {
        display: ${({isCrop}) => isCrop ? `block`:`none`};
        position: absolute;
        cursor: move;
        left: ${props => props.cropper.left}px;
        top: ${props => props.cropper.top}px;
        width: ${props => props.cropper.width}px;
        height: ${props => props.cropper.height}px;
        touch-action: manipulation;
        box-shadow: 0 0 0 9999em rgba(0, 0, 0, 0.5);
        box-sizing: border-box;
    }
    .crop_square_margin {
        width: 10px;
        height: 10px;
        background-color: white;
        border-radius: 2px;
        border: 1px solid #333;
        opacity: 0.8;
        position: absolute;
    }
    .ne {
        top: -5px;
        right: -5px;
        cursor: ne-resize;
    }
    .se {
        bottom: -5px;
        right: -5px;
        cursor: se-resize;
    }
    .sw {
        bottom: -5px;
        left: -5px;
        cursor: sw-resize;
    }
    .nw {
        top: -5px;
        left: -5px;
        cursor: nw-resize;
    }
    img {
        width: 100%;
        height: 100%;
    }
`

const Main = ({size}) => {
    const storage = window.firebase.storage();
    const allInputs = {imgUrl: ''}
    const [imageAsFile, setImageAsFile] = useState('')
    const [imageAsUrl, setImageAsUrl] = useState(allInputs)
    const [load, setLoad] = useState(false)
    const canvas = useRef()
    const image = useRef()
    const imageWrapper = useRef()
    const [cropper, setCropper] = useState({
        width: 200,
        height: 100,
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        wide: false
    })
    let ctx

    const [file, setFile] = useState('')
    async function fileHandler(e) {
        setImageAsFile(e.target.files[0])
        const reader = new FileReader();
        reader.onloadend = function(event) {
            setFile(reader.result)
        }
        await reader.readAsDataURL(e.target.files[0])
        // setFile(reader.result)
        setLoad(true)
        // await canvasHandler(e)
        setIsCrop(true)
        console.log(cropper)
        ctx = canvas.current.getContext("2d")
        setCanvasPos({width:cropper.width, height:cropper.height})
        image.current.onload = () => {
            const {scaleX, scaleY} = getScale();
            console.log(scaleX, scaleY)
            ctx.drawImage(
                image.current,
                cropper.left,
                cropper.top,
                cropper.width*scaleX,
                cropper.height*scaleY,
                0,
                0,
                cropper.width,
                cropper.height
             )
            }
    }

    function canvasHandler(e) {
        image.current.onload = () => {
            ctx.drawImage(image.current, 0, 0)
            ctx.front = "40px Courier"
            // ctx.fillText(text, 210, 75)
        }
    }

    const firebaseHandler = e => {
        e.preventDefault();
        const uploadTask = storage.ref(`/images/${imageAsFile.name}`).put(imageAsFile);
        uploadTask.on('state_changed', 
        (snapShot) => {
          //takes a snap shot of the process as it is happening
          console.log(snapShot)
        }, (err) => {
          //catches the errors
          console.log(err)
        }, () => {
          // gets the functions from storage refences the image storage in firebase by the children
          // gets the download url then sets the image from firebase as the value for the imgUrl key:
          storage.ref('images').child(imageAsFile.name).getDownloadURL()
           .then(fireBaseUrl => {
             setImageAsUrl(prevObject => ({...prevObject, imgUrl: fireBaseUrl}))
           })
        })
    }

    const [canvasPos, setCanvasPos] = useState({
        width: 0,
        height: 0
    })
    const getScale = () => {
        let imageW = image.current.naturalWidth;
        let wrapperW = imageWrapper.current.offsetWidth;
        let imageH = image.current.naturalHeight;
        let wrapperH = imageWrapper.current.offsetHeight;
        let scaleX
        let scaleY
        scaleX = imageW/wrapperW;
        scaleY = imageH/wrapperH;
        return {scaleX,scaleY}
    }
    const getCroppedImg = () => {
        const {scaleX, scaleY} = getScale();
        ctx = canvas.current.getContext("2d");
        console.log(scaleX, scaleY)
        ctx.drawImage(
            image.current,
            cropper.left,
            cropper.top,
            cropper.width*scaleX,
            cropper.height*scaleY,
            0,
            0,
            cropper.width,
            cropper.height
         )
        // const reader = new FileReader()
        // canvas.current.toBlob(blob => {
        //     reader.readAsDataURL(blob)
        //     reader.onloadend = () => {
        //         this.dataURLtoFile(reader.result, 'cropped.jpg')
        //     }
        // })
    }
    const [isCrop, setIsCrop] = useState(false)
    const clamp = (num, min, max) => {
        return Math.max(Math.max(num,min),max)
    }

    const makeNewCrop = () => {
        const width = imageWrapper.current.width
        const height = imageWrapper.current.height
        return {
            unit: 'px',
            // aspect: crop.aspect,
            x: (cropper.left * width) / 100,
            y: (cropper.top * height) / 100,
            width: (cropper.width * width) / 100,
            height: (cropper.height * height) / 100,
          };
    }
    const dragCrop = (e) => {
        e.preventDefault();
        if (isDragging) {
            const nextCrop = makeNewCrop();
            const {width, height} = imageWrapper.current;
            nextCrop.x = e.clientX-dragPos.startX;
            nextCrop.y = e.clientY-dragPos.startY;
            console.log(e.clientX, dragPos.startX)
            return setCropper(prev => ({...prev, left:dragPos.prevX+nextCrop.x, top:dragPos.prevY+nextCrop.y}))
        }         
    }
    const [isDragging, setIsDragging] = useState(false)
    const [dragPos, setDragPos] = useState({
        startX:0,
        startY:0,
        prevX: 0,
        prevY: 0
    })
   
    const startDrag = (e) => {
        setDragPos({startX: e.clientX, startY: e.clientY, prevX: cropper.left, prevY:cropper.top})
        setIsDragging(true)
    }
    const endDrag = () => {
        console.log('up')
        console.log(cropper)
        setIsDragging(false)
        // const {scaleX, scaleY} = getScale();
        // ctx = canvas.current.getContext("2d");
        // ctx.drawImage(
        //     image.current,
        //     cropper.left*scaleX,
        //     cropper.top*scaleY,
        //     cropper.width*scaleX,
        //     cropper.height*scaleY,
        //     0,
        //     0,
        //     cropper.width,
        //     cropper.height
        //  )
        getCroppedImg();
    }

    useEffect(() => {
        if (size.wide === true && cropper.wide === false) {
            setCropper(oldArray => ({...oldArray, height: oldArray.width, width:oldArray.height, wide: true}));
        } else {
            setCropper(oldArray => ({...oldArray, height: oldArray.width, width:oldArray.height, wide: false}));
        }
    }, [size])
    useEffect(() => {
        if (image.current) {
            console.log('crop')
            getCroppedImg();
        }
    }, [cropper])

    return (
        <MainCanvas cropper={cropper} isCrop={isCrop}>
            <div className="canvas_container" onMouseUp={endDrag} >
                <div className="canvas" ref={imageWrapper}>
                    {load ? <img ref={image} src={file} alt="uploadedImg" />:null}  
                </div>
                    {/* <div ref={crop} className="cropper"> */}
                        <div className="crop_square" onMouseDown={e => startDrag(e)} onMouseMove={e => dragCrop(e)} >
                            <div className="crop_square_margin ne"></div>
                            <div className="crop_square_margin se"></div>
                            <div className="crop_square_margin sw"></div>
                            <div className="crop_square_margin nw"></div>
                        </div>
                    {/* </div> */}
            </div>
            <canvas ref={canvas} width={cropper.width} height={cropper.height} />
            <div>
                <form onSubmit={firebaseHandler}>
                    <label>
                        <input type='file' onChange={fileHandler}/>
                    </label>
                    <input type='submit' value='submit' />
                </form>
            </div>
        </MainCanvas>
    )
}

export default Main

