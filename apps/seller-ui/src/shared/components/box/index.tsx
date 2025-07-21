"use client"

import styled from "styled-components"

interface Props {
    css?: React.CSSProperties
}

export const Box = styled.div.attrs<Props>(({ css }) => ({
    style: css
})) <Props>`
box-sizing: border-box
`